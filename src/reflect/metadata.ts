import './reflect';

if (!Reflect.metadata) {
    type prop = string | symbol;
    const storage:WeakMap<any, Map<prop, Map<string, any>>> = new WeakMap();
    
    class Metadata {
        static get(target: any, property?: prop): Map<string, any> {
            if (false === storage.has(target)) {
                storage.set(target, new Map());
            }
            
            if (false === storage.get(target).has(property || 'constructor')) {
                storage.get(target).set(property || 'constructor', new Map());
            }
            
            return storage.get(target).get(property || 'constructor');
        }
    }
    
    Reflect.metadata = function (metadataKey: string, metadataValue: any): ClassDecorator | PropertyDecorator {
        return (target: any, propertyKey?: string | symbol) => {
            Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
        }
    };

    Reflect.defineMetadata = function (metadataKey: string, metadataValue: any, target: any, propertyKey?: prop): void {
        Metadata.get(target, propertyKey).set(metadataKey, metadataValue);
    };

    Reflect.hasMetadata = function (metadataKey: string, target: any, propertyKey?: prop): boolean {
        return Metadata.get(target, propertyKey).has(metadataKey);
    };

    Reflect.hasOwnMetadata = function (metadataKey: string, target: any, propertyKey?: prop): boolean {
        return Metadata.get(target, propertyKey).has(metadataKey);
    };

    Reflect.getMetadata = function (metadataKey: string, target: any, propertyKey?: prop): string {
        return Metadata.get(target, propertyKey).get(metadataKey);
    };

    Reflect.getOwnMetadata = function (metadataKey: string, target: any, propertyKey?: prop): string {
        return Metadata.get(target, propertyKey).get(metadataKey);
    };

    Reflect.getMetadataKeys = function (target: any, propertyKey?: prop): string[] {
        return [...Metadata.get(target, propertyKey).keys()];
    };

    Reflect.getOwnMetadataKeys = function (target: any, propertyKey?: prop): string[] {
        return [...Metadata.get(target, propertyKey).keys()];
    };

    Reflect.deleteMetadata = function (metadataKey: string, target: any, propertyKey: prop): void {
        Metadata.get(target, propertyKey).delete(metadataKey);
    }
}
