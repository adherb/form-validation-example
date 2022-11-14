# form-validation-example

This example uses immer-reducer to mutate state by writing drafts. 

Different cases apply immedialty or after a delay. For example when the user is entering their email, we don't want to throw errors on every key stroke, we want to wait until the user has finished typing, wait a short delay, then check if they have entered a valid email, then we can provide feedback to the user.
