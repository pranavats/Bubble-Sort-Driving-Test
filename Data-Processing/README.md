# Bubble Sort Driving Test Data Processing

Data Processing for Bubble Sort Driving Test experiment.

## Table of Contents

- [Bubble Sort Driving Test Data Processing](#bubble-sort-driving-test-data-processing)
  - [Table of Contents](#table-of-contents)
  - [Metrics](#metrics)
    - [Data format](#data-format)
    - [Explanation](#explanation)
  - [Obtaining the metrics](#obtaining-the-metrics)
    - [Files](#files)
    - [Steps](#steps)

## Metrics

### Data format

```text
prelim_scores = {
  'runID': {
    'runID',
    'initialArray',
    'finalGoldenArray',
    'finalUserArray',
    'finalStateMatch',
    'finalArrayMatch',
    'arrayHasUniques',
    'totalSplitLength',
    'splitCount',
    'userRunLength',
    'goldenRunLength',
    'runIntersections': {
      'intersectionPoints': [
        {
          'userRunPoint',
          'goldenRunPoint'
        }
      ],
      'intersectionCount'
    },
    'spans': {
      'mergeSpans',
      'splitSpans': {
        'uc',
        'gc'
      }
    },
    'invariants': {
      'inv1',
      'inv2',
      'inv3'
    }
  }
}
```

### Explanation

Each `runID` has the following metrics:

- `runID`: ID assigned to the particular run.
- `initialArray`: Initially generated array.
- `finalGoldenArray`: Final state of Golden Run array.
- `finalUserArray`: Final state of User Run array.
- `finalStateMatch`: Boolean of whether or not the final states of the runs match.
- `finalArrayMatch`: Boolean of whether or not the final arrays of the runs match.
- `arrayHasUniques`: Boolean of whether or not the Initial Array is unique.
- `totalSplitLength`: Distance for which User deviates from Golden Run.
- `splitCount`: Number of deviations by user from Golden Run.
- `userRunLength`: Number of effects by the User.
- `goldenRunLength`: Number of effects in the Golden Run.
- `runIntersections`: Data of Intersection Points of the runs.
  - `intersectionPoints`: List of Intersection Point indexes.
    - `userRunPoint`: Index of point in User Run.
    - `goldenRunPoint`: Index of point in Golden Run.
  - `intersectionCount`: Number of Intersection Points.
- `spans`: Data of Merge and Sort Spans.
  - `mergeSpans`: List of Merge Spans.
  - `splitSpans`: List of Split Spans of the form (_uc,gc_).
  - `invariants`: List of Invariants.
    - `inv1`: Number of Events where `a[i] < a[j]` for all _j_ < _i_.
    - `inv2`: Number of Events where `a[k] < a[m]` if _k_ > _m_, for _k,m_ >= _b_.
    - `inv3`: Number of Events where `i >= b`.

## Obtaining the metrics

### Files

- Mapping of `userID`, `runID` and `machineID` (algorithm name) is present in `runTable.csv`.
- Transition state data of each `runID` is present in `runTransitionTable.csv`.
- `cleandata.py` is used to clean up the stored data and to generate necessary experiment data for further processing.
- `prelim_scores.py` is used to process experiment data to generate the metrics.
- `dumpdata.py` is used to polish the metrics to generate csv with final processed data.

### Steps

1. Run `cleandata.py` as `python cleandata.py runTable.csv runTransitionTable.csv experiment.json`
   1. Data from `runTable.csv` and `runTransitionTable.csv` is processed in `cleandata.py` to generate formatted data into `experiment.json`.
2. Run `prelim_scores.py` as `python prelim_scores.py experiment.json metrics.json`
   1. Cleaned up data (present in `experiment.json`) is read into `prelim_scores.py`.
   2. Adjust the input parameters to ensure the data is read properly.
   3. Majority of the code remains same as only the state is being verified.
   4. Generate the Golden Run by creating appropriate actions and functions in `goldenRun.py` and make sure that the state parameters matches those of the drive run data.
   5. The metrics are generated into `metrics.json`.
3. Run `dumpdata.py` as `python dumpdata.py metrics.json file.csv`.
   1. Metrics from `metrics.json` are processed to generate a CSV as `file.csv`.
