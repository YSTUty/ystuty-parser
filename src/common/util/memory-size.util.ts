export const memorySizeOf = (obj: any) => {
    function sizeOf(obj) {
        if (obj === null || obj === undefined) {
            return 0;
        }
        switch (typeof obj) {
            case 'number':
                return 8;
            case 'string':
                return obj.length * 2;
            case 'boolean':
                return 4;
            case 'object': {
                const objClass = Object.prototype.toString
                    .call(obj)
                    .slice(8, -1);
                if (objClass === 'Object' || objClass === 'Array') {
                    let bytes = 0;
                    for (const key in obj) {
                        if (!obj.hasOwnProperty(key)) continue;
                        bytes += sizeOf(obj[key]);
                    }
                    return bytes;
                }
                return obj.toString?.().length * 2;
            }
        }
        return 0;
    }
    return sizeOf(obj);
};

export const formatByteSize = (bytes: number) =>
    bytes === Infinity || bytes < 2 ** 10
        ? bytes + ' bytes'
        : bytes < 2 ** 20
        ? (bytes / 2 ** 10).toFixed(3) + ' KiB'
        : bytes < 2 ** 30
        ? (bytes / 2 ** 20).toFixed(3) + ' MiB'
        : (bytes / 2 ** 30).toFixed(3) + ' GiB';
