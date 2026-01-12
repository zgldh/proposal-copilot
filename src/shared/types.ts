export interface IBackendResponse {
    status: 'ok' | 'error';
    data: unknown;
    timestamp: number;
}
