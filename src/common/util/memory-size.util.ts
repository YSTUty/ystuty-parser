export const memorySizeOf = (obj: any) => {
    let bytes = 0;

    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number': {
                    bytes += 8;
                    break;
                }
                case 'string': {
                    bytes += obj.length * 2;
                    break;
                }
                case 'boolean': {
                    bytes += 4;
                    break;
                }
                case 'object': {
                    const objClass = Object.prototype.toString
                        .call(obj)
                        .slice(8, -1);
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (const key in obj) {
                            if (!obj.hasOwnProperty(key)) continue;
                            sizeOf(obj[key]);
                        }
                    } else bytes += obj.toString().length * 2;
                    break;
                }
            }
        }
        return bytes;
    }
    return sizeOf(obj);
};

export const formatByteSize = (bytes: number) =>
    bytes < 2 ** 10
        ? bytes + ' bytes'
        : bytes < 2 ** 20
        ? (bytes / 2 ** 10).toFixed(3) + ' KiB'
        : bytes < 2 ** 30
        ? (bytes / 2 ** 20).toFixed(3) + ' MiB'
        : (bytes / 2 ** 30).toFixed(3) + ' GiB';
