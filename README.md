# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**
- store data + hash(secret, data)
  - this prevents an attacker from modifying the data, as the hash check would fail
  - user can provide secret when writing and verifying data
  - Limitations:
    - if the user forgets their secret, they will be unable to verify their data. This is acceptable as building a password reset feature is out of scope

Other security considerations
  - connection with the server using TLS -> encryption in transit / over the wire
    - not necessary for localhost, but a server TLS certificate would be necessary in production
  - associate customer data with customer, s.t. no other other users can write to those records
    - user sessions solve this, but are overkill for this demo app + we only have one user
  - CORS policy
    - easy to add for local development and is necessary for prod
  - add CSP
    - again easy to add and necessary
  - sanitize inputs for XSS
    - rendering user input with JSX (auto escapes) so no issue here
  - secure /http only cookies
    - not setting cookies
  - audit log
    - could be used to store all data updates and allow the user to choose which to recover from, but this is better supported by a more robust backup system. Logs should be used for debugging and monitoring. We could use logs to record user logins and API usage, but is overkill for this project
<br />

**2. If the data has been tampered with, how can the client recover the lost data?**
- keep data in in-memory db and backup to file
  - this allows data recovery if the node process is killed
  - data recovery from backup (e.g. server restart) can also require successful verification
  - Limitations:
    - if the attacker has root access on the server, they will be able to delete the file backup, preventing recovery. Ideally we backup to remote storage (e.g. S3)

Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance
