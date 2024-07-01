# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**
- whatever user inputs, they can read it back it unmodified
- how to guarantee this?
  - data checksum 
    - client server checksum
  - connection with the server using TLS -> encryption in transit / over the wire
  - associate customer data with customer, s.t. no other other users can write to those records -> user sessions  
  - once packets arrive at the server, server can authenticate requests -> row level security (RLS) i.e. can we write to certain records in the db
  - CORS policy
  - CSP
  - sanitize inputs for XSS
  - secure /http only cookies
  - CSRF tokens
  - other headers Examples include X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection
  - audit log


Assumptions and Limitations
  - if the data is stored in the database with these security measures, it is tamper proof
  - 

<br />
**2. If the data has been tampered with, how can the client recover the lost data?**
    - also if data is lost / deleted in some other way
    - store as a file on disk
      - data structure
        - timestamp
        - message
        - user_id

Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance
