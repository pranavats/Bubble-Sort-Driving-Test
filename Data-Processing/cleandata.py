import pandas as pd
import datetime
import sys

# State = [
#     Arr
#     i
#     b
# ]
  
# Action = Enum [
#     IncrementIAndSwap
#     IncrementI
#     DecrementBAndReset
#     Undo
#     Redo
#     Reset
#     Submit
#     ConfirmSubmit
#     CancelSubmit
#     Init
# ]

# Effect = [
#     action: Action
#     timestamp: UnixTimeStamp
#     newState: State
# ]

# Run = [
#     runId: String
#     initState : State
#     SequenceOfEffects: List<Effect>
#     starttime : UnixTimeStamp 
# ]

# Experiment = [
#     experimentId: Number
#     date: Date
#     userMap: map<userId, List<runId>>
#     driveRun: map<runId, Run>
# ]


def createUserMap(filename):
    """
    Function to create a mapping between userIds and their runIds from a csv file.

    Parameters
    ---------

    - `filename`: Name or Path of file containing the runTable.
    """

    usermap = pd.read_csv(filename)
    print("Number of runs:",len(usermap))
    usermap = usermap.reset_index(drop=True)

    dfs = {}
    for name, group in usermap.groupby('userId'):
        dfs[name] = group.reset_index(drop=True).to_dict(orient='records')

    print("Usermap of userId's with their runId's has been created.")
    return dfs

def extractCurrentState(obj):
    """
    Function to read the information of the current state.

    Parameters
    ----------

    - `obj`: JSON object containing run action details.
    """
    import json
    obj_json = json.loads(obj)

    state = {}
    state['numbers'] = [obj['N'] for obj in obj_json['numbers']['L']]
    state['i'] = obj_json['i']['N']
    state['b'] = obj_json['b']['N']
    return state

def createRunMap(filename):
    """
    Function to create a mapping between runIds and their run data from a csv file.

    Parameters
    ---------

    - `filename`: Name or Path of file containing the runTransitionTable.
    """
    runmap = pd.read_csv(filename)
    print("Number of run actions:",len(runmap))
    runmap = runmap.groupby('runId').apply(lambda x: x.sort_values('timestamp'))
    runmap = runmap.reset_index(drop=True)

    dfs = {}
    for name,group in runmap.groupby('runId'):
        try:
            df_selected = group.reset_index(drop=True)
            postStates = df_selected['postState'].apply(extractCurrentState)

            df_selected = df_selected[['timestamp', 'type']]
            df_selected['state'] = postStates

            dfs[name] = df_selected.to_dict(orient='records')
        except Exception as e:
            print("Could not parse atttempt for ", name,e)

    print("Run transitions for each runId have been created.")
    return dfs

def create_experiment():
    experiment = {
        "experiment_id": 1,
        "date": datetime.datetime(2023, 5, 3).isoformat(),
        "userMap": createUserMap(sys.argv[1]),
        "driveRun": createRunMap(sys.argv[2]),
    }

    import json
    # dumping json into a file
    with open(sys.argv[3], 'w') as f:
        json.dump(experiment, f)

    print("JSON file with experiment data has been generated.")
    return experiment

experiment = create_experiment()
