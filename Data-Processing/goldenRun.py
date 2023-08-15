from enum import Enum

class Action(Enum):
    SwapAndIncrement = 'SwapAndIncrement'
    Increment = 'Increment'
    DecrementBAndResetI = 'DecrementBAndResetI'
    Submit = 'Submit'
    ConfirmSubmit = 'ConfirmSubmit'
    Init = 'Init'
    Undo = 'Undo'
    Redo = 'Redo'
    Reset = 'Reset'
    CancelSubmit = 'CancelSubmit'

def convert_to_action(actionString):
    """ Function to convert string of the name of an action into an Action. """
    if actionString == 'SwapAndIncrement':
        return Action.SwapAndIncrement
    elif actionString == 'Increment':
        return Action.Increment
    elif actionString == 'DecrementBAndResetI':
        return Action.DecrementBAndResetI
    elif actionString == 'Submit':
        return Action.Submit
    elif actionString == 'ConfirmSubmit':
        return Action.ConfirmSubmit
    elif actionString == 'Init':
        return Action.Init
    elif actionString == 'Undo':
        return Action.Undo
    elif actionString == 'Redo':
        return Action.Redo
    elif actionString == 'Reset':
        return Action.Reset
    elif actionString == 'CancelSubmit':
        return Action.CancelSubmit
    else:
        raise Exception("Action not found")

def generate_golden_run(array):
    """
    Function to generate the golden bubble sort run for an input array.

    Parameters
    ----------

    - `array`: Initial array.
    """
    # creating a duplicate array to avoid changing the input array
    arr = []
    for index in range(len(array)):
        arr.append(array[index])

    n = len(arr)
    i = 0
    b = n

    # initialisation
    effects = []
    effects.append(
        {
            'type': Action.Init,
            'state': {
                'numbers': [],
                'i': str(i),
                'b': str(b)
            }
        }
    )

    for index in range(len(arr)):
        effects[0]['state']['numbers'].append(arr[index])

    while b > 1: # Stop condition. Here, array is sorted when boundary reaches 1.
        action = None
        state = {
            'numbers': [],
            'i': i,
            'b': b
        }

        # deciding the experiment event
        if i == b - 1:
            action = Action.DecrementBAndResetI
        elif float(arr[i]) > float(arr[i + 1]):
            action = Action.SwapAndIncrement
        else:
            action = Action.Increment

        # implementing the event
        if action == Action.SwapAndIncrement:
            arr[i], arr[i + 1] = arr[i + 1], arr[i]
            i += 1
        elif action == Action.Increment:
            i += 1
        elif action == Action.DecrementBAndResetI:
            b -= 1
            i = 0

        # storing the effect
        for index in range(len(arr)):
            state['numbers'].append(arr[index])
        state['i'] = str(i)
        state['b'] = str(b)

        effects.append(
            {
                'type': action,
                'state': state
            }
        )

    # storing submit effect
    effects.append(
        {
            'type': Action.Submit,
            'state': {
                'numbers': [],
                'i': str(i),
                'b': str(b)
            }
        }
    )

    for index in range(len(arr)):
        effects[-1]['state']['numbers'].append(arr[index])

    # storing confirm submit effect
    effects.append(
        {
            'type': Action.ConfirmSubmit,
            'state': {
                'numbers': [],
                'i': str(i),
                'b': str(b)
            }
        }
    )

    for index in range(len(arr)):
        effects[-1]['state']['numbers'].append(arr[index])

    return effects

# # Test the code
# array = [64, 34, 25, 12, 22, 11, 90]
# print("Original list:", array)
# effects = generate_golden_run(array)
# print("Sorted list:", effects[-1]['state']['numbers'])
# print("Run Length:", len(effects))
# for i in range(len(effects)):
#     print("Action: ", effects[i]['type'])
#     print("Numbers: ", effects[i]['state']['numbers'])
#     print("i: ", effects[i]['state']['i'], " b: ", effects[i]['state']['b'])
