import json


with open("final_seeder.json") as file:
    global data
    data = json.loads(file.read())

for question in data:
    if question["name"] == "ARRRCRT":
        print(question["testCases"])


# with open("final_seeder_new.json", "w") as file:
#     file.write(json.dumps(data))
