import json
import os

import requests


def purge_cache():
    headers = {
        'Authorization': 'Bearer ' + os.environ.get("CLOUDFLARE_TOKEN"),
        'Content-Type': 'application/json'
    }

    r = requests.delete(
        'https://api.cloudflare.com/client/v4/zones/' + '18152a31e3e0256bb84774276e34ad5c' + '/purge_cache',
        headers=headers,
        data=json.dumps({'purge_everything': True}))
    print(f'Cloudflareのキャッシュパージ完了: {r.status_code}')
