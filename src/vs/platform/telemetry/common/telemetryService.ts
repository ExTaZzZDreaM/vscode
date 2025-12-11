/* CorpCode Telemetry Disabled */

export class TelemetryService {

    publicLog(eventName: string, data?: any): Promise<void> {
        return Promise.resolve();
    }

    publicLog2<E extends Record<string, any>, P extends Record<string, any>>(eventName: string, data?: E): Promise<void> {
        return Promise.resolve();
    }

    getTelemetryInfo(): Promise<any> {
        return Promise.resolve({
            sessionId: "corpcode-disabled",
            machineId: "corpcode-disabled",
            firstSessionDate: "",
            msftInternal: false
        });
    }

    setEnabled(): void {
        // noop
    }

    isEnabled(): boolean {
        return false;
    }
}
