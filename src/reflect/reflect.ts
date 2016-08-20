declare namespace Reflect {
    type prop = string | symbol;
    export function metadata(metadataKey: string, metadataValue: string): ClassDecorator | PropertyDecorator;
    export function defineMetadata(metadataKey: string, metadataValue: string, target: any, propertyKey?: prop): void;
    export function hasMetadata(metadataKey: string, target: any, propertyKey?: prop): boolean;
    export function hasOwnMetadata(metadataKey: string, target: any, propertyKey?: prop): boolean;
    export function getMetadata(metadataKey: string, target: any, propertyKey?: prop): string;
    export function getOwnMetadata(metadataKey: string, target: any, propertyKey?: prop): string;
    export function getMetadataKeys(target: any, propertyKey?: prop): string[];
    export function getOwnMetadataKeys(target: any, propertyKey?: prop): string[];
    export function deleteMetadata(metadataKey: string, target: any, propertyKey?: prop): void;
}
