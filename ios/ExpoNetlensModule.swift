import ExpoModulesCore

public class ExpoNetlensModule: Module {
    private var interceptorActive = false
    private var nativeRecordCount = 0

    public func definition() -> ModuleDefinition {
        Name("ExpoNetlens")

        // --- Sync functions (JSI — zero overhead on New Arch) ---

        Function("isRunning") { [weak self] () -> Bool in
            return self?.interceptorActive ?? false
        }

        Function("getRecordCount") { [weak self] () -> Int in
            return self?.nativeRecordCount ?? 0
        }

        // --- Async functions (I/O) ---

        AsyncFunction("startNativeInterception") { [weak self] () in
            guard let self = self else { return }
            guard !self.interceptorActive else { return }
            self.interceptorActive = true
            // Phase 2: start URLProtocol interception + log capture here
        }

        AsyncFunction("stopNativeInterception") { [weak self] () in
            guard let self = self else { return }
            guard self.interceptorActive else { return }
            self.interceptorActive = false
            self.nativeRecordCount = 0
            // Phase 2: stop URLProtocol interception + log capture here
        }

        // --- Events (JSI dispatch on New Arch — low latency) ---
        // Phase 2: these will be emitted by NativeTrafficInterceptor and NativeLogCapture
        Events("onNativeTraffic", "onNativeLog", "onShake")

        // --- Lifecycle ---

        OnDestroy {
            self.interceptorActive = false
            self.nativeRecordCount = 0
        }
    }
}
