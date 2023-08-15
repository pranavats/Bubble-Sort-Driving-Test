from goldenRun import Action, convert_to_action, generate_golden_run

import json
import sys

# prelim_scores = {
#     'runID': {
#         'runID',
#         'initialArray',
#         'finalGoldenArray',
#         'finalUserArray',
#         'finalStateMatch',
#         'finalArrayMatch',
#         'arrayHasUniques',
#         'totalSplitLength',
#         'splitCount',
#         'userRunLength',
#         'goldenRunLength',
#         'runIntersections': {
#             'intersectionPoints': [
#                 {
#                     'userRunPoint',
#                     'goldenRunPoint'
#                 }
#             ],
#             'intersectionCount'
#         },
#         'spans': {
#             'mergeSpans',
#             'splitSpans': {
#                 'uc',
#                 'gc'
#             }
#         },
#         'invariants': {
#             'inv1',
#             'inv2',
#             'inv3'
#         },
#         'goldenRun',
#         'userRun'
#     }
# }

# user run lengths
# golden run lengths
# intersection counts
# spans
# whether final state is correct or not

def cleanupUndoAndRedo(actions):
    """
    Function to process undo and redo actions.

    Parameters
    ----------

    - `actions`: Array containing all the actions.
    """

    # Process the actions
    processed_actions = []
    undo_redo_actions = []
    for i in range(len(actions)):
        if actions[i]['type'] == Action.Undo:
            if i > 0:
                # Remove the previous action
                undo_redo_actions.append(processed_actions.pop())
        elif actions[i]['type'] == Action.Redo:
            if len(undo_redo_actions) > 0:
                # Add the removed action back
                processed_actions.append(undo_redo_actions.pop())
        elif actions[i]['type'] == Action.Reset:
            # Remove all actions so far
            processed_actions = [actions[0]]
        else:
            # Keep the action as it is
            processed_actions.append(actions[i])

    return processed_actions

def cleanupCancelSubmit(actions):
    """
    Function to remove submit actions which aren't confirmed.

    Parameters
    ----------

    - `actions`: Array containing all the actions.
    """

    boundary = len(actions) - 1;
    i = 0
    # Process the actions
    while i < boundary:
        if actions[i]['type'] == Action.Submit and actions[i + 1]['type'] == Action.CancelSubmit:
            del actions[i]
            del actions[i]
            i -= 1
            boundary = len(actions) - 1 # this is to ensure the boundary is adjusted after decreasing the number of elements
        i += 1

    return actions

def preprocess_driveRun(driveRun):
    """
    Function to clean up the run.

    Parameters
    ----------

    - `driveRun`: Array containing the run details.
    """

    # convert all actions to action Enums
    for runID in driveRun.keys():
        for effect in driveRun[runID]:
            effect['type'] = convert_to_action(effect['type'])

    # remove those RunIDs that don't end in Submit, ConfirmSubmit
    keys_To_Delete = []

    for runID in driveRun.keys():
        actions = [item['type'] for item in driveRun[runID]]

        if (
            len(actions) > 3 and
            actions[0] == Action.Init and
            actions[-2] == Action.Submit and 
            actions[-1] == Action.ConfirmSubmit
        ):
            pass
        else:
            keys_To_Delete.append(runID)

    for runID in keys_To_Delete:
        del driveRun[runID]

    # at this point, we only have the runs that begin in Init and End in Submit, ConfirmSubmit
    # cleanup Undos and Redos and CancelSubmit

    for runID in driveRun.keys():
        actions = driveRun[runID]

        actions = cleanupCancelSubmit(actions)
        actions = cleanupUndoAndRedo(actions)

        driveRun[runID] = actions

    return driveRun

def find_intersections(user_run, golden_run):
    """
    Function to find all intersection points between runs.

    Parameters
    ----------

    - `user_run`: Array containing all the run actions of the user.
    - `golden_run`: Array containing all the run actions of the golden run.
    """

    intersections = []
    goldenRunIndex = 0
    for i in range(len(user_run)):
        for j in range(goldenRunIndex,len(golden_run)):
            if user_run[i]['state'] == golden_run[j]['state']:
                # If the points match, store the index of the points
                intersections.append(
                    {
                        'userRunPoint': i,
                        'goldenRunPoint': j
                    }
                )
                goldenRunIndex = j + 1
                break

    return intersections

def find_spans(user_run, golden_run):
    """
    Function to find all spans between runs.

    Parameters
    ----------

    - `user_run`: Array containing all the run actions of the user.
    - `golden_run`: Array containing all the run actions of the golden run.
    """
    mergeSpans = []
    splitSpans = []
    intersections = find_intersections(user_run,golden_run)
    distance = 0

    for index in range(len(intersections)):
        if index and ((intersections[index]['userRunPoint'] - 1 != intersections[index - 1]['userRunPoint']) or (intersections[index]['goldenRunPoint'] - 1 != intersections[index - 1]['goldenRunPoint'])):
            # Checking if merge distance is greater than 0
            if distance > 0:
                # Append merge distance and reset counter
                mergeSpans.append(distance)
                distance = 0

            # Add uc and gc distances to split span
            splitSpans.append(
                {
                    'uc': intersections[index]['userRunPoint'] - intersections[index - 1]['userRunPoint'],
                    'gc': intersections[index]['goldenRunPoint'] - intersections[index - 1]['goldenRunPoint'],
                    'status': "merged"
                }
            )
        else:
            # Keep increasing for counting merge distance
            distance += 1

    # for cases where the ending of the runs is a merge span
    if (distance > 0):
        mergeSpans.append(distance)
    # for cases where the last point of intersection is not the run's final point, span tends to infinity
    if (intersections[-1]['goldenRunPoint'] != len(golden_run) - 1):
        # MJ: Instead of infinity, we will use length+1
        #splitSpans.append(
        #    {
        #        'uc': str(float('inf')), # MJ: Instead of infinity, we will use length+1
        #        'gc': str(float('inf'))
        #    }
        #)
        splitSpans.append(
            {
                'uc': len(user_run) - intersections[-1]['userRunPoint']+1,
                'gc': len(golden_run) - intersections[-1]['goldenRunPoint']+1,
                'status': "unmerged"
            }
        )

    return {
        'mergeSpans': mergeSpans,
        'splitSpans': splitSpans
    }

def generate_invariants(user_run):
    """
    Function to generate invariants.

    Parameters
    ----------

    - `user_run`: Array containing all the run actions of the user.
    """

    invariants = {
        'inv1': 0,
        'inv2': 0,
        'inv3': 0
    }

    for index in range(len(user_run)):
        # converting values from strings to numbers for calculation
        i = int(user_run[index]['state']['i'])
        b = int(user_run[index]['state']['b'])
        numbers = [] # creating a copy so as to not modify the original
        for j in range(len(user_run[index]['state']['numbers'])):
            numbers.append(int(user_run[index]['state']['numbers'][j]))

        # invariant 1
        # a[i] holds the max value out of first i numbers (a[i] >= a[j] for all j < i)
        for j in range(i):
            if numbers[i] < numbers[j]:
                invariants['inv1'] += 1
                break

        # invariant 2
        # subarray starting from b is sorted (a[k] >= a[m] if k > m, for k, m >= b)
        for j in range(b,len(numbers) - 1):
            if b >= len(numbers) or j + 1 >= len(numbers):
                break
            if numbers[j + 1] < numbers[j]:
                invariants['inv2'] += 1
                break

        # invariant 3
        # i does not go beyond b (i <= b)
        if i >= b: # i == b is also a problem, shouldn't happen. 
            invariants['inv3'] += 1

    return invariants

def userRunList(exprun):
    """
    Function to generate the user run.

    Parameters
    ----------

    - `user_run`: Array containing all the run actions of the user.
    - `golden_run`: Array containing all the run actions of the golden run.
    """
    runlist = list()
    for i in exprun:
        # print(i["state"])
        runlist.append((i["type"].value, i["state"]))

    return runlist

def generate_prelim_scores():
    """ Function to generate prelim scores. """

    with open(sys.argv[1], 'r') as file:
        experiment = json.load(file)

    driveRun = experiment['driveRun']
    driveRun = preprocess_driveRun(driveRun)

    print("Number of proper user runs:",len(driveRun))

    # generate golden runs
    golden_runs = {}
    for runID in driveRun.keys():
        startArr = driveRun[runID][0]["state"]["numbers"]
        golden_runs[runID] = generate_golden_run(startArr)

    metrics = {}

    for runID in driveRun.keys():
        intersection_data = find_intersections(driveRun[runID] , golden_runs[runID])
        merge_split_spans = find_spans(driveRun[runID] , golden_runs[runID])

        metrics[runID] = {
            # ID of the run
            "runID": runID,
            # initial array
            'initialArray':driveRun[runID][0]['state']["numbers"],
            # array after golden run
            'finalGoldenArray': golden_runs[runID][-1]['state']["numbers"],
            # array after user run
            'finalUserArray': driveRun[runID][-1]['state']["numbers"],
            # check whether final state is correct or not
            'finalStateMatch': (driveRun[runID][-1]['state'] == golden_runs[runID][-1]['state']),
            # check whether final array is correct or not
            'finalArrayMatch': (driveRun[runID][-1]['state']["numbers"] == golden_runs[runID][-1]['state']["numbers"]),
            # check whether initial array has unique values or not
            # set function retains only unique elements, so length of array before and after set operation should be same if it has only uniques
            'arrayHasUniques': len(driveRun[runID][0]['state']["numbers"]) == len(set(driveRun[runID][0]['state']["numbers"])),
            # length of user run which deviates from golden run
            'totalSplitLength': sum(map(lambda elem: elem['uc'], merge_split_spans['splitSpans']), 0), # sum(map(myfunc, merge_split_spans['splitSpans']), 0)
            # number of deviations from golden run
            'splitCount': len(merge_split_spans['splitSpans']),
            # calculate user run lengths
            'userRunLength': len(driveRun[runID]),
            # calculate golden run lengths
            'goldenRunLength': len(golden_runs[runID]),
            # generate intersection counts
            'runIntersecions': {
                'intersectionPoints': intersection_data,
                'intersectionCount': len(intersection_data)
            },
            # generate spans
            # We're considering the following:
            #     - Merge spans include all the common points except the first point in each set of consecutive points
            #     - Split spans include all the non-common points
            'spans': merge_split_spans,
            # check invariants
            'invariants': generate_invariants(driveRun[runID]),
            'goldenRun': userRunList(golden_runs[runID]),
            'userRun': userRunList(driveRun[runID])
        }

    # return prelim_scores
    return metrics
    #return {"runs": metrics}

def runmain():
    """ Main wrapper function. """
    prelim_scores = generate_prelim_scores()
    # write data to a json file
    with open(sys.argv[2], 'w') as f:
        json.dump(prelim_scores, f)

    print("JSON file with metrics has been generated.")

if __name__ == "__main__":
    runmain()
