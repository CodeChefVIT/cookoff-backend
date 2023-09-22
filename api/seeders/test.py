import json


with open("final_seeder.json") as file:
    global data
    data = json.loads(file.read())

for question in data:
    question["points"] = 10


with open("final_seeder_new.json", "w") as file:
    file.write(json.dumps(data))
