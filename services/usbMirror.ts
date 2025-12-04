// Minimal WebUSB ADB + scrcpy + WebCodecs integration
// Uses dynamic imports and loose typing to keep build stable across library versions

export interface UsbMirrorController {
  stop: () => Promise<void>;
}

export async function startUsbMirror(canvas: HTMLCanvasElement, onLog: (msg: string, type?: 'info' | 'error' | 'success') => void): Promise<UsbMirrorController> {
  let cleanup: (() => Promise<void>) | null = null;

  try {
    onLog('Requesting Android device via WebUSB...', 'info');

    const webusb: any = await import('@yume-chan/adb-backend-webusb');
    const adbLib: any = await import('@yume-chan/adb');
    const scrcpyLib: any = await import('@yume-chan/adb-scrcpy');
    const scrcpyCore: any = await import('@yume-chan/scrcpy');
    const decoderLib: any = await import('@yume-chan/scrcpy-decoder-webcodecs');
    const streamExtra: any = await import('@yume-chan/stream-extra');

    if (!(navigator as any).usb) {
      throw new Error('WebUSB not available: use Chrome/Edge over HTTPS or localhost');
    }

    const filters = [
      // Common Android vendor IDs
      { vendorId: 0x18d1 }, // Google
      { vendorId: 0x04e8 }, // Samsung
      { vendorId: 0x12d1 }, // Huawei
      { vendorId: 0x2717 }, // Xiaomi
      { vendorId: 0x2a70 }, // OnePlus
      { vendorId: 0x22d9 }, // OPPO
      { vendorId: 0x2d95 }, // vivo
    ];
    let device: any;
    try {
      if (typeof webusb.AdbWebUsbBackend?.requestDevice === 'function') {
        device = await webusb.AdbWebUsbBackend.requestDevice({ filters });
      } else {
        device = await (navigator as any).usb.requestDevice({ filters });
      }
    } catch (err: any) {
      // Fallback: show all devices if filters missed
      if (err?.name === 'NotFoundError') {
        onLog('No matching Android device found with filters, showing all devices...', 'info');
        if (typeof webusb.AdbWebUsbBackend?.requestDevice === 'function') {
          device = await webusb.AdbWebUsbBackend.requestDevice({ filters: [] });
        } else {
          device = await (navigator as any).usb.requestDevice({ filters: [] });
        }
      } else {
        throw err;
      }
    }
    if (!device) throw new Error('No device selected');

    let backend: any;
    if (typeof webusb.AdbWebUsbBackend?.fromDevice === 'function') {
      backend = await webusb.AdbWebUsbBackend.fromDevice(device);
    } else if (typeof webusb.AdbWebUsbBackend === 'function') {
      backend = new webusb.AdbWebUsbBackend(device);
    } else {
      throw new Error('AdbWebUsbBackend not available');
    }

    const connection = await backend.connect();
    const adb = new adbLib.Adb(connection);
    // Authenticate if necessary (WebUSB usually doesn’t require keys)
    if (typeof adb.connect === 'function') {
      await adb.connect();
    }

    onLog('Starting scrcpy server on device...', 'info');

    const Options = scrcpyLib.AdbScrcpyOptions2_1 ?? scrcpyLib.AdbScrcpyOptions1_24;
    const options = new Options({
      video: {
        codec: 'h264',
        maxSize: 1080,
        bitRate: 8_000_000,
        tunnel: 'adb',
      },
      audio: false,
      tunnelForward: true,
    });

    let client: any;
    try {
      client = await scrcpyLib.AdbScrcpyClient.start(adb, scrcpyCore.DefaultServerPath, options);
    } catch (err: any) {
      const c = new scrcpyLib.AdbScrcpyClient(adb, options);
      try {
        const s = await c.start();
        client = { streams: s };
      } catch (e: any) {
        onLog('ADB unauthorized or scrcpy server failed to start. Please accept USB debugging dialog on device and try again.', 'error');
        throw e;
      }
    }

    if (client?.output?.pipeTo && streamExtra?.WritableStream) {
      try {
        await client.output.pipeTo(new streamExtra.WritableStream({
          write(chunk: any) {
            const text = typeof chunk === 'string' ? chunk : (() => {
              try { return new TextDecoder().decode(chunk); } catch { return String(chunk); }
            })();
            onLog(`scrcpy: ${text}`, 'info');
          }
        }));
      } catch {}
    }

    const decoder = new decoderLib.ScrcpyDecoderWebCodecs({ canvas });
    const videoStream = client.videoStream ?? client.streams?.video ?? client.streams ?? client;
    if (!videoStream) throw new Error('No video stream from scrcpy');

    onLog('Decoding H.264 stream via WebCodecs...', 'info');
    if (typeof decoder.decode === 'function') {
      decoder.decode(videoStream);
    } else if (typeof decoder.render === 'function') {
      decoder.render(videoStream);
    }

    cleanup = async () => {
      try {
        if (typeof client.close === 'function') await client.close();
        if (typeof connection.close === 'function') await connection.close();
      } catch {}
    };

    onLog('USB mirror started', 'success');
  } catch (e: any) {
    console.error(e);
    let hint = '';
    if (e?.name === 'SecurityError') hint = 'SecurityError: use HTTPS (GitHub Pages) or localhost, and enable USB debugging.';
    if (e?.name === 'NotFoundError') hint = 'No device selected or no matching device; ensure phone is connected and unlocked.';
    if (e?.message?.includes('unauthorized')) hint = 'Device unauthorized: accept the USB debugging prompt and check Developer options.';
    const detail = JSON.stringify({ name: e?.name, message: e?.message, stack: e?.stack }, null, 2);
    onLog(`USB mirror failed: ${e?.message || e}${hint ? ' | ' + hint : ''}\n${detail}`, 'error');
    throw e;
  }

  return {
    stop: async () => {
      if (cleanup) await cleanup();
      onLog('USB mirror stopped', 'info');
    },
  };
}

