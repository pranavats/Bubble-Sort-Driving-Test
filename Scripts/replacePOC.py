import fileinput, sys

fp = open(sys.argv[1],"r")

org = ""
name = ""
email = ""
mobile = ""

while org == "" or name == "" or email == "" or mobile == "":
  temp = fp.readline().strip()
  if 'org:' in temp:
    org = temp.removeprefix('org:')
  elif 'name:' in temp:
    name = temp.removeprefix('name:')
  elif 'email:' in temp:
    email = temp.removeprefix('email:')
  elif 'mobile:' in temp:
    mobile = temp.removeprefix('mobile:')

orgExp = "const orgOfPOC = null;"
nameExp = "const nameOfPOC = null;"
emailExp = "const emailOfPOC = null;"
mobileExp = "const mobileOfPOC = null;"

for line in fileinput.FileInput(sys.argv[2], inplace=True):
  if orgExp in line:
    line = line.replace('null','"' + org.strip() + '"')
  elif nameExp in line:
    line = line.replace('null','"' + name.strip() + '"')
  elif emailExp in line:
    line = line.replace('null','"' + email.strip() + '"')
  elif mobileExp in line:
    line = line.replace('null','"' + mobile.strip() + '"')
  
  print(line,end='')

print("Successfully inserted POC details.")
