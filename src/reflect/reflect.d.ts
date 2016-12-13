declare namespace Reflect {
    type prop = string | symbol;
    function metadata(metadataKey: string, metadataValue: string): ClassDecorator | PropertyDecorator;
    function defineMetadata(metadataKey: string, metadataValue: string, target: any, propertyKey?: prop): void;
    function hasMetadata(metadataKey: string, target: any, propertyKey?: prop): boolean;
    function hasOwnMetadata(metadataKey: string, target: any, propertyKey?: prop): boolean;
    function getMetadata(metadataKey: string, target: any, propertyKey?: prop): string;
    function getOwnMetadata(metadataKey: string, target: any, propertyKey?: prop): string;
    function getMetadataKeys(target: any, propertyKey?: prop): string[];
    function getOwnMetadataKeys(target: any, propertyKey?: prop): string[];
    function deleteMetadata(metadataKey: string, target: any, propertyKey?: prop): void;
}
