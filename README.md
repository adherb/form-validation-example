# form-validation-example

Using immer-reducer to mutate state by writing drafts. 

Different cases apply immedialty or after a delay. For example when the user is entering their email, we don't want to throw errors on every key stroke, we want to wait until the user has finished typing, wait a delay, then check if they have entered a valid email.
