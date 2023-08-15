# All functions are created using ChatGPT. 

'''
1. Read the json from file.
2. Drop a list of elements from each dictionary object. 
3. Put the resultant json in a dataframe. 
4. Transpose the DF
5. Dump it in a csv file. 

'''
import sys
# import csv
import json
import pandas as pd
from flatten_json import flatten

def read_json_from_file(file_path):
    """
    Reading the data from JSON file.

    Parameters
    ----------

    - `file_path`: Name or Path of file containing metrics data.
    """
    with open(file_path, 'r') as file:
        json_data = json.load(file)
    return json_data

def delete_keys_from_json(json_data, keys_to_delete):
    """
    Deleting select keys from the data.

    Parameters
    ----------

    - `json_data`: JSON object containing metrics.
    - `keys_to_delete`: Array containing strings of keys of delete from the metrics.
    """
    # Iterate over each top value in the JSON object
    for top_value in json_data.values():
        # Check if the top value is a JSON object
        if isinstance(top_value, dict):
            # Remove keys from the top value
            for key in keys_to_delete:
                top_value.pop(key, None)

    # Return the modified JSON object
    return json_data

def json_to_transposed_dataframe(json_data):
    """
    Transposing the data to have headers at the top.

    Parameters
    ----------

    - `json_data`: JSON object containing metrics.
    """
    df = pd.DataFrame(json_data)
    transposed_df = df.T  # Transpose the DataFrame
    return transposed_df
    # return df

def write_dataframe_to_csv(dataframe, filename):
    """
    Writing data into CSV file.

    Parameters
    ----------

    - `dataframe`: JSON object containing metrics.
    - `filename`: Name or Path of file where the final data is to be stored as a csv file.
    """
    dataframe.to_csv(filename, index=False)

def flatten_invariants(json_data):
    """ Flattening the invariant data. """
    remove_key = "invariants"
    for key in json_data:
        val = json_data[key]
        if remove_key in val:
            valbackup = val[remove_key]
            del val[remove_key]
            flat = flatten(valbackup)
            #print("Removing: " + json.dumps(valbackup, indent=3))
            val.update(flat)
            #print("Added\n")

    return json_data

def runmain():
    """ Main wrapper function. """

    if len(sys.argv) < 3:
        print("Error: Please provide two file names as command-line arguments, for example 'python dumpdata.py metrics.json summary.csv'.")
        print("Usage: python program_name.py <json file to read from> <csv file to write into>")
        return

    file1 = sys.argv[1] # JSON file to read from
    file2 = sys.argv[2] # CSV file to write into

    initjson = read_json_from_file(file1)
    modjson = delete_keys_from_json(initjson,['runIntersecions','spans'] )
    newjson = flatten_invariants(modjson)
    tdf = json_to_transposed_dataframe(newjson)
    write_dataframe_to_csv(tdf, file2)

    print("CSV file with processed data has been generated.")

runmain()

#df = pd.read_json('./metrics.json') # read the generated metrics json
#newdf = df.T.drop(['runIntersecions','spans'], axis = 1) # transpose and drop the columns not req
#newdf.to_csv('file.csv') # Dump the file into csv
