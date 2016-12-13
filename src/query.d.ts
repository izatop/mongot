export declare class Query {
    private meta;
    private query;
    constructor(target: Function, query: Object);
    private normalize(value);
    format(query?: Object): any;
}
