import React, { useEffect, useState } from 'react';
// import { useParams } from "react-router-dom";

import API from './api';

// List of Actions
const Action = Object.freeze({
  Init: 'Init',
  Undo: 'Undo',
  Redo: 'Redo',
  Reset: 'Reset',
  Submit: 'Submit',
  CancelSubmit: 'CancelSubmit',
  ConfirmSubmit: 'ConfirmSubmit',
  Increment: 'Increment',
  SwapAndIncrement: 'SwapAndIncrement',
  DecrementBAndResetI: 'DecrementBAndResetI',
});

interface BubbleSortState {
  numbers: number[],
  i: number,
  b: number,
};

// API Function Calls

/**
 * API call to create a run for a userId and set the runId.
 * @param userId The userId of the user.
 * @param setRunId Function to set the runId.
 */
const createRun = async (userId: string, setRunId: React.Dispatch<React.SetStateAction<string>>) => {
  await API
    .post(
      `/createRun`, JSON.stringify({
        id: userId,
        machineId: "bubbleSort",
      })
    )
    .then((response: any) => {
      // Set the runId.
      setRunId(response.data.id);
    })
    .catch((error: any) => {
      console.log(error);
    });
};

/**
 * API call to update the Run parameters.
 * @param payload Payload for the API.
 * @param runId The runId of the current run.
 * @param type The action performed.
 * @param preState The state before the action.
 * @param postState The state after the action.
 */
const updateRun = async (
  payload: any,
  runId: string,
  type: string,
  preState: BubbleSortState,
  postState: BubbleSortState
) => {
  // If runId is undefined, then the user has not been initialised
  if (runId === "") {
    return;
  }
  // Log the current state into the browser console.
  console.log(JSON.stringify({
    id: runId,
    payload: payload === undefined ? {} : payload,
    type: type,
    preState: preState === undefined ? {} : preState,
    postState: postState === undefined ? {} : postState,
    timestamp: Date.now()
  }));
  await API
    .post(
      `/updateRun`, JSON.stringify({
        id: runId,
        payload: payload === undefined ? {} : payload,
        type: type,
        preState: preState === undefined ? {} : preState,
        postState: postState === undefined ? {} : postState,
        timestamp: Date.now()
      })
    )
    .then(response => {
      console.log(response);
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
};

/**
 * API call to update that the run is completed.
 * @param id The userId of the user of the current run.
 */
const complete = async (id: string) => {
  let final = `/complete/` + id;
  await API
    .get(final)
    .then(response => {
      // console.log(response);
      // console.log(response.data);
      // window.alert("Thank you for your participation.");
    })
    .catch(error => {
      console.log(error);
    });
};

// Getting User ID
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const userId = urlParams.get('id');

const arrayLength = 6;

/** Function to create a randomly generated array. */
function createRandomArray() {
  let array: number[];
  array = [];
  let count = arrayLength;

  while (count > 0) {
    array.push(Math.round(Math.random() * 10));
    count -= 1;
  };

  return array;
};

/**
 * Function to create an object containing state data.
 * @param numbers The array of numbers.
 * @param i Current index.
 * @param b Current boundary.
 * @returns Object of the BubbleSort State type.
 */
function createState(numbers: number[], i: number, b: number) {
  return {
    numbers: numbers,
    i: i,
    b: b,
  };
};

/**
 * Function to update the array containing list of previous states.
 * @param pastStates Array with list of previous states.
 * @param state State to be added.
 * @returns Updated past states array.
 */
function handlePastStateUpdate(pastStates: BubbleSortState[], state: BubbleSortState) {
  let newPastStateArray = pastStates.slice();
  newPastStateArray.push({ ...state });
  return newPastStateArray;
};

/**
 * Function to update the array containing list of future states.
 * @param futureStates Array with list of future states.
 * @param state State to be added.
 * @returns Updated future states array.
 */
function handleFutureStateUpdate(futureStates: BubbleSortState[], state: BubbleSortState) {
  let newFutureStateArray = futureStates.slice();
  newFutureStateArray.unshift({ ...state });
  return newFutureStateArray;
};

const initialNumbers = createRandomArray();

export function BubbleTest(bubbleSortParams: { userId: string | null }) {
  // Initialisation
  const userId = bubbleSortParams.userId;
  // const [userId, setUserId] = useState<string | null>(bubbleSortParams.userId);
  const [runId, setRunId] = useState<string>("");
  const [preState, setPreState] = useState<BubbleSortState>({} as BubbleSortState);
  // const [i, setI] = useState(0);
  // const [b, setB] = useState(arrayLength);
  // const [numbers, setNumbers] = useState(initialNumbers);
  const [state, setState] = useState<BubbleSortState>(createState(initialNumbers, 0, arrayLength));
  const [pastStates, setPastStates] = useState<BubbleSortState[]>([]);
  const [futureStates, setFutureStates] = useState<BubbleSortState[]>([]);
  const [type, setType] = useState<string>(Action.Init);
  const [prompt, setPrompt] = useState<string>("Experiment Initialised.");

  // Logging after every user action
  useEffect(() => {
    // Generating Run ID
    if (userId !== null && runId === "") {
      // console.log(userId);
      createRun(userId, setRunId);
    }
    else if (userId !== null) {
      updateRun({}, runId, type, preState, state);
    }
  }, [userId, runId, type, preState, state]); // API will be called when these dependencies change provided userId is defined

  return (
    <div
      className='wrapper'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
        height: '92vh',
        // overflow: 'auto',
      }}
    >
      {/* Header */}
      <header
        className='header'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'darkturquoise',
          padding: '1%',
          width: '100%',
          height: '7.5%',
          color: 'white',
        }}
      >
        <span
          className='headerTitle'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '25%',
          }}
        >
          <strong>Bubble Sort Driving Test</strong>
        </span>
        <span
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '25%',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <button
            type='button'
            onClick={() => {
              setPastStates(handlePastStateUpdate(pastStates, state));
              setFutureStates([]);
              setPreState({ ...state });
              setType(Action.Submit);
              setPrompt("Confirm Submission?");
            }}
            disabled={type === Action.Submit || type === Action.ConfirmSubmit}
            style={{
              padding: '1%',
              backgroundColor: 'mediumturquoise',
              border: 'solid 2px white',
              borderRadius: '10px',
              fontWeight: 'bold',
            }}
          >
            Submit Run
          </button>
        </span>
      </header>
      {/* Main Body */}
      <div
        className='body'
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginInlineStart: '0.5%',
          marginInlineEnd: '0.5%',
          justifyContent: 'start',
          alignItems: 'center',
          height: '92.5%',
          width: '100%',
          overflowY: 'auto',
        }}
      >
        {/* Prompt Display */}
        <div
          className='prompt'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '5%',
            width: '100%',
          }}
        >
          {prompt}
        </div>
        {/* Experiment */}
        <div
          className='experiment'
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '95%',
            width: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Experiment Description */}
          <div
            className='description'
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              width: '33.33%',
              padding: '0.5%',
              overflowY: 'auto',
              border: 'solid 1px grey',
            }}
          >
            <div
              className='objectives'
              style={{ marginBlock: '1%' }}
            >
              <h1 style={{ textAlign: 'center' }}><strong><em>Objective</em></strong></h1>
              <p>
                Apply Bubble Sort Algorithm on the given array to sort it using the provided controls.
                <br />
                Please note that:
              </p>
              <ol style={{ paddingInlineStart: '7.5%', listStyle: 'outside' }}>
                <li style={{ display: 'list-item', listStyle: 'inherit' }}>You are not supposed to apply any optimizations over the original bubble sort algorithm.</li>
                <li style={{ display: 'list-item', listStyle: 'inherit' }}>Sorting of the array is the secondary objective; The primary objective is the correct application of the bubble sort algorithm.</li>
              </ol>
            </div>
            <div
              className='variablesDescription'
              style={{ marginBlock: '1%', textAlign: 'center' }}
            >
              <h1><strong><em>Variables Description</em></strong></h1>
              <table id="variables-table">
                <thead>
                  <tr>
                    <th style={{ border: 'solid 2px' }}>Variable</th>
                    <th style={{ border: 'solid 2px' }}>Data Type</th>
                    <th style={{ border: 'solid 2px' }}>Valid values</th>
                    <th style={{ border: 'solid 2px' }}>Initialization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: 'solid 2px' }}>i</td>
                    <td style={{ border: 'solid 2px' }}>int</td>
                    <td style={{ border: 'solid 2px' }}>[0,n)</td>
                    <td style={{ border: 'solid 2px' }}>0</td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ border: 'solid 2px' }}>b</td>
                    <td style={{ border: 'solid 2px' }}>int</td>
                    <td style={{ border: 'solid 2px' }}>[0,n]</td>
                    <td style={{ border: 'solid 2px' }}>n</td>
                  </tr>
                </tbody>
              </table>
              <p>where n is the length of the array.</p>
            </div>
            <div
              className='controlsDescription'
              style={{ marginBlock: '1%', textAlign: 'center' }}
            >
              <h1><strong><em>Controls Description</em></strong></h1>
              <table id="controls-table">
                <thead>
                  <tr>
                    <th style={{ border: 'solid 2px' }}>Control</th>
                    <th style={{ border: 'solid 2px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: 'solid 2px' }}>Increment i</td>
                    <td style={{ border: 'solid 2px' }}>Increments i by 1, if i &lt; n - 1</td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ border: 'solid 2px' }}>Swap And Increment i</td>
                    <td style={{ border: 'solid 2px' }}>Swaps array[i] and array[i+1], and increments i by 1, if i &lt; n - 1</td>
                  </tr>
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ border: 'solid 2px' }}>Decrement b And Reset i</td>
                    <td style={{ border: 'solid 2px' }}>Decrements b by 1 and resets i to 0, if b &gt; 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className='procedure'
              style={{ marginBlock: '1%' }}
            >
              <h1 style={{ textAlign: 'center' }}><strong><em>Procedure</em></strong></h1>
              <ol style={{ paddingInlineStart: '7.5%', listStyle: 'decimal' }}>
                <li style={{ display: 'list-item', listStyle: 'inherit' }}>Click on suitable control to simulate next step of bubble sort algorithm.</li>
                <li style={{ display: 'list-item', listStyle: 'inherit' }}>You can do <em>Undo</em> and <em>Redo</em> actions or <em>Reset</em> the experiment by clicking on the respective buttons as per your need.</li>
                <li style={{ display: 'list-item', listStyle: 'inherit' }}>Click on the <em>Submit Run</em> button when you are done.</li>
              </ol>
            </div>
          </div>
          {/* Experiment Container */}
          <div
            className='experimentContainer'
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '66.67%',
              overflowY: 'auto',
              border: 'solid 1px grey',
            }}
          >
            {/* Experiment Window */}
            <div
              className='experimentWindow'
              style={{
                display: (type !== Action.Submit && type !== Action.ConfirmSubmit) ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                width: '100%',
                height: '100%',
                alignItems: 'center',
              }}
            >
              {/* State Variables */}
              <div
                className='variables'
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                  height: '20%',
                }}
              >
                {/* Values of i and b */}
                <div
                  className='IandB'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    width: '20%',
                  }}
                >
                  <span style={{ display: 'flex' }}>i = {state.i}</span>
                  <span style={{ display: 'flex' }}>b = {state.b}</span>
                </div>
                <div
                  className='array'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '80%',
                  }}
                >
                  {/* Number Array */}
                  <div
                    className='arrayValues'
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <span>value:</span>
                    {state.numbers.map((value, index) => (
                      <span
                        className='values'
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '1%',
                          borderRadius: '10px',
                          border: state.i === index ? 'dashed 2px dodgerblue' : 'solid 2px dodgerblue',
                          backgroundColor: state.i === index ? 'palegoldenrod' : 'lightskyblue',
                        }}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                  <div
                    className='arrayIndices'
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <span>index:</span>
                    {state.numbers.map((value, index) => (
                      <span
                        className='values'
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '1.25%',
                        }}
                      >
                        {index}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div
                className='buttons'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                  height: '20%',
                }}
              >
                {/* Specific Action Buttons */}
                <div
                  className='specificActions'
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '75%',
                  }}
                >
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    disabled={state.i >= arrayLength - 1}
                    onClick={() => {
                      if (state.i < arrayLength) {
                        setPastStates(handlePastStateUpdate(pastStates, state));
                        setFutureStates([]);
                        setPreState({ ...state });
                        setState(createState(state.numbers, state.i + 1, state.b));
                        // setI(i + 1);
                        setType(Action.Increment);
                        setPrompt("Value of 'i' increased by 1.");
                      }
                      else { setPrompt("Value of 'i' cannot be increased anymore."); }
                    }}
                  >
                    Increment i
                  </button>
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    disabled={state.i >= arrayLength - 1}
                    onClick={() => {
                      if (state.i < arrayLength) {
                        setPastStates(handlePastStateUpdate(pastStates, state));
                        setFutureStates([]);
                        setPreState({ ...state });
                        let newNumbers = state.numbers.slice();
                        newNumbers[state.i] = state.numbers[state.i + 1];
                        newNumbers[state.i + 1] = state.numbers[state.i];
                        // setNumbers(newNumbers);
                        // setI(i + 1);
                        setState(createState(newNumbers, state.i + 1, state.b));
                        setType(Action.SwapAndIncrement);
                        setPrompt("Swap successful and value of 'i' increased by 1.");
                      }
                      else { setPrompt("No further element to swap with."); }
                    }}
                  >
                    Swap and Increment i
                  </button>
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    disabled={state.b <= 0}
                    onClick={() => {
                      if (state.b > 0) {
                        setPastStates(handlePastStateUpdate(pastStates, state));
                        setFutureStates([]);
                        setPreState({ ...state });
                        // setB(b - 1);
                        // setI(0);
                        setState(createState(state.numbers, 0, state.b - 1));
                        setType(Action.DecrementBAndResetI);
                        setPrompt("Value of 'i' reset to 0 and 'b' decreased by 1.");
                      }
                      else { setPrompt("Value of 'b' cannot be decreased anymore."); }
                    }}
                  >
                    Decrement b And Reset i
                  </button>
                </div>
                {/* Common Action Buttons */}
                <div
                  className='specificIndices'
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '50%',
                  }}
                >
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    disabled={pastStates.length <= 0}
                    onClick={() => {
                      if (pastStates.length > 0) {
                        setFutureStates(handleFutureStateUpdate(futureStates, state));
                        setPreState({ ...state });
                        setState(pastStates[pastStates.length - 1]);
                        let newPastStates = pastStates.slice();
                        newPastStates.pop();
                        setPastStates(newPastStates);
                        setType(Action.Undo);
                        setPrompt("Undo successful.");
                      }
                      else { setPrompt("No actions to undo."); }
                    }}
                  >
                    Undo
                  </button>
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    disabled={futureStates.length <= 0}
                    onClick={() => {
                      if (futureStates.length > 0) {
                        setPastStates(handlePastStateUpdate(pastStates, state));
                        setPreState({ ...state });
                        setState(futureStates[0]);
                        let newFutureStates = futureStates.slice();
                        newFutureStates.shift();
                        setFutureStates(newFutureStates);
                        setType(Action.Redo);
                        setPrompt("Redo successful.");
                      }
                      else { setPrompt("No actions to redo."); }
                    }}
                  >
                    Redo
                  </button>
                  <button
                    type='button'
                    style={{
                      display: 'flex',
                      margin: '1%',
                      padding: '1%',
                      alignItems: 'center',
                      borderRadius: '10px',
                      border: 'solid 2px rosybrown',
                      backgroundColor: 'burlywood',
                    }}
                    onClick={() => {
                      setPastStates([]);
                      setFutureStates([]);
                      setPreState({} as BubbleSortState);
                      setState(createState(initialNumbers, 0, arrayLength));
                      setType(Action.Reset);
                      setPrompt("Experiment reset to initial state.");
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            {/* Confirm Submit Window */}
            <div
              style={{
                display: type === Action.Submit ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                height: '85%',
                alignItems: 'center',
              }}
            >
              <strong>Do you want to confirm your submission?</strong>
              <div
                className='buttons'
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '20%',
                }}
              >
                <button
                  type='button'
                  style={{
                    display: 'flex',
                    margin: '1%',
                    padding: '1%',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: 'solid 2px rosybrown',
                    backgroundColor: 'burlywood',
                  }}
                  onClick={() => {
                    setPastStates(handlePastStateUpdate(pastStates, state));
                    setFutureStates([]);
                    setPreState({ ...state });
                    setType(Action.ConfirmSubmit);
                    setPrompt("Submission Confirmed.");
                    if (userId !== null) { complete(userId); }
                  }}
                >
                  Confirm
                </button>
                <button
                  type='button'
                  style={{
                    display: 'flex',
                    margin: '1%',
                    padding: '1%',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: 'solid 2px rosybrown',
                    backgroundColor: 'burlywood',
                  }}
                  onClick={() => {
                    setPastStates(handlePastStateUpdate(pastStates, state));
                    setFutureStates([]);
                    setPreState({ ...state });
                    setType(Action.CancelSubmit);
                    setPrompt("Submission Cancelled.");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {/* Thank You Message */}
            <div
              className='thanksMessage'
              style={{
                display: type === Action.ConfirmSubmit ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                height: '85%',
                alignItems: 'center',
              }}
            >
              <strong>Thank You For Participating!</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
