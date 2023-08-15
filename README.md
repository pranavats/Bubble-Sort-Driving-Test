# Bubble-Sort-Driving-Test

Repository containing required files and scripts to deploy the Driving Test using custom backend database.

## Table of Contents

- [Bubble-Sort-Driving-Test](#bubble-sort-driving-test)
  - [Table of Contents](#table-of-contents)
  - [Folder Structure](#folder-structure)
  - [Requirements](#requirements)
    - [Accounts](#accounts)
    - [Local Machine Installations](#local-machine-installations)
  - [Overall Setup](#overall-setup)
    - [GitHub](#github)
    - [Backend](#backend)
      - [Account Setup](#account-setup)
      - [Configuring Backend](#configuring-backend)
    - [Frontend](#frontend)
  - [Data Processing](#data-processing)

## Folder Structure

```text
|_Bubble-Sort-Driving-Test
  |_Backend
  |_Frontend
  |_Data-Processing
  |_Scripts
  |_makefile
  |_README.md
```

## Requirements

_Note: Setting up of Amazon Web Service requirements is explained in the [**Account Setup Section**](#account-setup)._

### Accounts

- Amazon Web Services (AWS) Account
- AWS IAM authorised user
- GitHub Account

### Local Machine Installations

- AWS Command Line Interface (CLI)
- AWS Serverless Application Model (SAM) CLI
- Git
- Node.js
- Python

## Overall Setup

1. Ensure all the [_**requirements**_](#requirements) are satisfied.
2. **Fork** this repository to create your personal copy.
3. Follow the steps in the [GitHub Section](#github) to clone the forked repository locally onto your machine. _(Requires **Git** to be set up on your local machine.)_
4. Navigate to the `Bubble-Sort-Driving-Test` folder.
5. Follow the steps mentioned in the [Backend Section](#backend).
6. In `backendLink.txt` (present in `Scripts` folder), replace `LinkToBackend` with your backend's _**Prod Stage WebEndpoint** (baseURL)_. The format of the file's contents should look similar to this after modification: `https://link-prelude.amazonaws.com/Prod`, where `link-prelude` is unique to your account.
    - Note:
        1. The baseURL link can be found under the _Outputs_ tab in _**CloudFormation > Stacks > DT-Backend**_. Be sure that the website's _region_ is the **same region set in the `samconfig.toml` file**.
        2. Please ensure that **only the link** is present in the `backendLink.txt` document, else the deployment may fail.
7. Enter your _**POC** (Point Of Contact)_ details in `POC.txt` (present in `Scripts` folder) by replacing the following _(spaces can be included in between the names)_:
    - `YourOrganisation` with the name of your organisation.
    - `YourName` with your name.
    - `youremail@example.com` with your e-mail ID.
    - `YourNumber` with your mobile number.
8. Follow the steps mentioned in the [Frontend Section](#frontend).
9. The website will be deployed live through GitHub.
    - If your GitHub username is `user-name`, then the link to the website will be `user-name.github.io/Bubble-Sort-Driving-Test/home`.
10. Anyone can take the test using this link, and the data will be stored in the AWS Backend.
11. Follow the steps in the [Data Processing section](#data-processing) to process the collected Driving Test data.

### GitHub

_Note: Ensure to have your GitHub linked to Git on your local machine. For more details refer to [this page](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address#setting-your-commit-email-address-in-git)._

1. Go to your forked repository on the GitHub website.
2. Under the **`Code`** tab, copy the **`HTTPS`** link shown in _**Local**_.
3. Run the following command to clone the files to your local machine, where `copied-link` is the link copied above.

    ```bash
    git clone copied-link
    ```

### Backend

#### Account Setup

- Set-up AWS with your credentials, including an **IAM account** with _administrator access_.
  - Refer to the [AWS SAM Getting Started Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) for detailed instructions.
  - Ensure to complete the _**Prerequisites**_ and _**Installing the AWS SAM CLI**_ steps mentioned in the above link.
    - _(Optional)_ For simplicity, you may choose the long-term credentials method.
    - When creating the IAM administrative user, it is recommended to choose the One-Time-Password option.
    - After creating the user, create an access key ID and secret access key for _AWS CLI_ method.
    - Use the access key ID and secret access key to configure the **AWS CLI** on your local machine's terminal (bash).

#### Configuring Backend

1. _**(Optional)**_ In the `samconfig.toml` file, set the `region` to the region where you wish to host your backend.
    - The format is `region-direction-number`. Example: `eu-north-1`.
    - List of regions can be found at this [page](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions). If your chosen region has **Opt-in Status** listed as **Required**, then enable it by following the steps in [this page](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-regions.html#manage-acct-regions-enable-organization).
    - It is recommended to set this to the region closest to your location, however it is not a necessary step.
2. Open the **Bubble-Sort-Driving-Test** folder in Terminal/Bash _(Linux)_ or PowerShell _(Windows)_.
    - **Linux**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
3. Run `make backend` command. _(Requires **AWS CLI** and **AWS SAM CLI** to be set up on your local machine for successful setup completion.)_
4. Note the _**baseURL**_ endpoint link displayed after SAM backend set-up finishes to access the backend through APIs. The output is similar to this format:

    ```text
    Key                 WebEndpoint
    Description         API Gateway endpoint URL for Prod stage
    Value               LINK
    ```

    where `LINK` is the _baseURL_.

    - This can also be found in the _CloudFormation_ section in AWS Management Console.

### Frontend

1. Open the **Bubble-Sort-Driving-Test** folder in Terminal/Bash _(Linux)_ or PowerShell _(Windows)_.
    - **Linux**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
2. Run `make frontend` to set-up the frontend website and deploy it using GitHub. _(Requires **Python**, **Git** and **Node.js** to be set up on your local machine for successful frontend setup completion.)_

## Data Processing

1. Save the data in `RunTable` from DynamoDB into `runTable.csv` through the following steps:
    1. Sign in into AWS using your IAM account. Set the website's _region_ as the **same region set in the `samconfig.toml` file**.
    2. Search for **DynamoDB** and open it. It will be listed under the _Services_ category.
    3. Open the **`Tables`** tab displayed in the sidebar.
    4. Select the table named `BubbleSort-DT-Backend-RunTable` and click _**Explore table items**_.
    5. Click the **Run** button. A list of entries in the table will be displayed.
       - If the **Retrieve next page** button appears above the table entries, keep clicking it until it disappears so as to load all the entries in the table.
    6. Click on the **Actions** dropdown and select _**Download results to CSV**_.
    7. Save the data in CSV file as `runTable.csv` into the `Data-Processing` folder.
2. Save the data in `RunTransitionTable` from DynamoDB into `runTransitionTable.csv` through the following steps:
    1. Sign in into AWS using your IAM account. Set the website's _region_ as the **same region set in the `samconfig.toml` file**.
    2. Search for **DynamoDB** and open it. It will be listed under the _Services_ category.
    3. Open the **`Tables`** tab displayed in the sidebar.
    4. Select the table named `BubbleSort-DT-Backend-RunTransitionTable` and click _**Explore table items**_.
    5. Click the **Run** button. A list of entries in the table will be displayed.
       - If the **Retrieve next page** button appears above the table entries, keep clicking it until it disappears so as to load all the entries in the table.
    6. Click on the **Actions** dropdown and select _**Download results to CSV**_.
    7. Save the data in CSV file as `runTransitionTable.csv` into the `Data-Processing` folder.
3. Ensure that these two CSV files (`runTable.csv` and `runTransitionTable.csv`) are saved in the `Data-Processing` folder.
4. Open the **Bubble-Sort-Driving-Test** folder in Terminal/Bash _(Linux)_ or PowerShell _(Windows)_.
    - **Linux**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
5. Run `make summary`. The final processed data is stored in `summary.csv`.
