import requests

items = [[i['name'], i['clone_url']] for i in requests.get("https://api.github.com/users/melvinchia3636/repos?per_page=100&page=2").json()]

print(items)

for name, url in items:
    if not name in ["Music", "MTGGA-Minecraft", "textbooks"]:
        print(requests.post("http://192.168.0.117:3000/api/v1/repos/migrate", data={
            "clone_addr": url,
            "repo_name": name
            }, headers={
            "Authorization": "token 24917cb05938c54dd35205f33ae708a4a23efabb"
        }).text)