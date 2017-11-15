export class Img {
    url: string;
    title: string;
    description: string;
    createdBy: string;
    displayName: string;
    board: string;
    profilePicUrl: string;
    source?: boolean;
    broken?: boolean;
    _id?: string;
}
export class Board {
    title: string;
    coverUrl?: string;
    description?: string;
    secret?: boolean;
    imgs?: Img[];
    _id?: any;
}
