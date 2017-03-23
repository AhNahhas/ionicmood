export interface Vote {
    _id: string;
    channelId: string;
    status: number;
    time: Date;
    userId: string;
}