export type Message = {
    index: number;
    sender: string;
    message: string;
};

export interface ChatboxMessageAreaProps {
    messages: Message[];
    user: string;
}