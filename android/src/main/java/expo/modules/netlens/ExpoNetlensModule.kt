package expo.modules.netlens

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNetlensModule : Module() {
    private var interceptorActive = false
    private var nativeRecordCount = 0

    override fun definition() = ModuleDefinition {
        Name("ExpoNetlens")

        // --- Sync functions (JSI — zero overhead on New Arch) ---

        Function("isRunning") {
            interceptorActive
        }

        Function("getRecordCount") {
            nativeRecordCount
        }

        // --- Async functions (I/O) ---

        AsyncFunction("startNativeInterception") {
            if (!interceptorActive) {
                interceptorActive = true
                // Phase 2: start OkHttp interceptor + logcat reader here
            }
        }

        AsyncFunction("stopNativeInterception") {
            if (interceptorActive) {
                interceptorActive = false
                nativeRecordCount = 0
                // Phase 2: stop OkHttp interceptor + logcat reader here
            }
        }

        // --- Events (JSI dispatch on New Arch — low latency) ---
        // Phase 2: these will be emitted by NativeTrafficInterceptor and NativeLogCapture
        Events("onNativeTraffic", "onNativeLog", "onShake")

        // --- Lifecycle ---

        OnDestroy {
            interceptorActive = false
            nativeRecordCount = 0
        }
    }
}
