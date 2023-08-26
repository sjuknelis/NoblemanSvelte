export type Article = {
    id: number;
    title: string;
    author: string;
    volume: string;
    content: ArticleComponent[];
    isPublished: boolean;
    publishKeys: PublishKeys;
}

export type ArticleComponent = {
    type: string;
    data: {
        text?: string;

        src?: string;
        url?: string;
        credit?: string;
        caption?: string;
    }
}

export type PublishKeys = {
    id?: string;
    statIndex?: number;
}

export type VolumeStatus = {
    title: string;
    isPublished: boolean;
}

export type ComponentInteractions = {
    isFirst: boolean;
    isLast: boolean;
    moveUp: () => void;
    moveDown: () => void;
    delete: () => void;
}