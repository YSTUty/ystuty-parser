import * as url from 'url';
import * as https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as xEnv from '@my-environment';

export const makeProxy = (proxy = xEnv.PROXY_AGENT_URL) => {
    let httpsAgent: SocksProxyAgent | HttpsProxyAgent | https.Agent =
        new https.Agent({
            rejectUnauthorized: false,
        });
    let type = 'https';

    if (proxy) {
        if (proxy.startsWith('socks5')) {
            httpsAgent = new SocksProxyAgent({
                ...url.parse(proxy),
                // @ts-ignore
                rejectUnauthorized: false,
            });
            type = 'socks5-proxy';
        } else {
            httpsAgent = new HttpsProxyAgent({
                ...url.parse(proxy),
                rejectUnauthorized: false,
            });
            type = 'https-proxy';
        }
    }
    return [type, httpsAgent];
};
