import json

import requests


def purge_cache():
    CLOUDFLARE_GLOBAL_API_KEY = 'ea3215defb40a7a096f57b8e283e66a88f66a'
    CLOUDFLARE_ACCOUNT_EMAIL = 'ers7m3b@gmail.com'

    headers = {
        'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
        'X-Auth-Email': CLOUDFLARE_ACCOUNT_EMAIL,
        'Content-Type': 'application/json'
    }

    r = requests.delete(
        'https://api.cloudflare.com/client/v4/zones/' + '18152a31e3e0256bb84774276e34ad5c' + '/purge_cache',
        headers=headers,
        data=json.dumps({'purge_everything': True}))
    print(f'Cloudflareのキャッシュパージ完了: {r.status_code}')
