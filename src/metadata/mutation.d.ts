export abstract class SchemaMutate {
    constructor(document?: Object);
    protected abstract __mutate(document: Object): this;
}