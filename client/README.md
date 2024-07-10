# BattleBucks Frontend

## Steps for running

1. Install node
2. `npm install`
3. `vite`


For TRPC Reference Kinldy Go thorugh

[trpc Guide](https://trpc.io/docs/client/react)
[react-Query](https://tanstack.com/query/latest/docs/framework/react/overview)

```js
const { data, error, isLoading } = trpc.test.useQuery({ hello: " hi" })
// replace the `test` with the name of the query you want to use
if (isLoading) {
  return <div>Loading...</div>
}
// replace the `createUser` with the name of the query you want to use
const {data, error , isLoading } =trpc.createUser.useMutation({name:"hello"})
if(isLoading){
  return <div>Loading...</div>
}
```
