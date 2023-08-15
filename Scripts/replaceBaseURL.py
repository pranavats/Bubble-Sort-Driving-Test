import fileinput, sys

fp = open(sys.argv[1],"r")

backendBaseURL = ""

while backendBaseURL == "":
  backendBaseURL = fp.readline().strip()

searchExp = "baseURL: null,"
for line in fileinput.FileInput(sys.argv[2:], inplace=True):
  if searchExp in line:
    line = line.replace('null','"'+backendBaseURL+'"')
  print(line,end='')

print("Successfully inserted Backend URL.")
