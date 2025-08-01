# Objective

Design and implement a simple user profile service using Fastify, Postgres and Docker. This
service should store and retrieve basic profile data, with a focus on development best
practices and code quality.

# Requirements

# 1. Functionality

● A data model for storing user profiles with the following fields:
○ firstName
○ lastName
○ dateOfBirth
● Four endpoints:
○ Retrieve a single profile
○ Retrieve all profiles
○ Create a new profile
○ Update an existing profile

# 2. Observability

● Structured logging (Utilised Fastifies logging feature)

# 3. Code Quality

● Include:
○ Linting - ESLint (used eslint)
○ Formatting - Prettier (used prettier eslint-config-prettier eslint-plugin-prettier)
○ Testing - Vitest (added 7 tests)

# Instructions to run:
To run : npm run dev
To Test : npm test

#  HTTP method and routes
1. Retrieve all profiles - GET - http://localhost:3000/profiles

2. Retrieve a single profile - GET - http://localhost:3000/profileByLastName/lastName
    Eg. http://localhost:3000/profileByLastName/Gurunathan

3. Retrieve a single profile - GET - http://localhost:3000/profileById/pid
    Eg. http://localhost:3000/profileById/KGuru20070701

4. Retrieve a single profile - GET - http://localhost:3000/profileByDob/dob
    Eg. http://localhost:3000/profileByDob/2007-07-01

5. Create a new - POST - http://localhost:3000/profile
    Eg. body : {
            "firstName" : "Karthika",
            "lastName": "Gurunathan",
            "dateOfBirth": "2007-07-01"
        }
6. Update an existing profile - PATCH - http://localhost:3000/profile/pid
    Eg. http://localhost:3000/profile/KGuru20070701
        body : {
            "firstName" : "KarthikaK"
        }
7. Health check - GET - http://localhost:3000/health

# Assumptions
1. Introduced a new field "pid" as Primary and unique key.
   This is to prevent duplicate entries and to ease finding operations.

2. The field "PID" is the combination of all 3 fields.
   Eg. firstName = 'Emma', lastName = 'John', dateOfBirth = '2016-03-02' => PID = EJohn20160302

3. Retrieving single profile can be done by 3 ways :
    - lastName
    - pid
    - dateOfBirth
   Because many profiles can have the same "firstName", "date of birth" is less common for a find operation.
   Secondly "pid" is the combination and a unique key, so finding using "pid" can result in single exact row.
   Thirdly "lastName" is also less common when compared to "firstName" and retrieving can be easy as names are easy to remember.

4. Date field is set in format YYYY-MM-DD. Just due to time constraint to make it DD-MM-YYYY both in DB schema and Fastify schema validation.
   Trade-off for time to complete.
   Validation schema seemed important than slightly different date format.

5. Made sure the "pid" is consistent by updating "pid" field during update operation.
   As "pid" is the combination of all the other 3 fields.

6. Used PATCH instead of PUT for update profile operation.
   This allows modification just 1 field and not the all the fields.
   This can require extra bandwidth in request and also making request body complex. 

7. If time is extended, I would restructure the app.js code to separate db.js, routes.js and app.js

