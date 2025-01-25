#DevTinder APIS
===============

## authRouter
============ 

- POST /signup
- POST /login
- POST /logout

## profileRouter
================

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## ConnectionRequestRouter status : interested, ignored, accepted, rejected
===========================================================================

-POST /request/send/interested/:userId
-POST /request/send/ignored/:userId



-POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId

## userRouter
=============

-GET /user/requests/recieved
-GET /user/connections
-GET /user/feed => Gets you all the other profiles in the platform


NOTES:
/feed?page=1&limit=10   0-10 .skip(0).limit(10)
/feed?page=2&limit=10   11-20 .skip(10).limit(10)
/feed?page=3&limit=10   21-30 .skip(20).limit(10)
/feed?page=4&limit=10   31-40 .skip(30).limit(10)

// skip = (page - 1 )* limit
