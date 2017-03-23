export interface Comment {
    _id: string;
    channelId: string
    message: string;
    time: Date;
    userId: string;
}