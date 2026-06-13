If someone gives you problem
Do not jump to solution, 

Keep drawing the lines and boundaries, start small and keep expanding.

Start from the center and expand in every direction instead only going towards 1. Meaning not focused on 1 area instead growing it in all direction be it database, Frotend, backend, Server, loadbalancer could be anything. 

Split it into multi subcomponents or feature.

Example: Design facebook.

Components/Features could be.
- Authenticatiom
- Feed
- Notification

Then Disect each component and keep expanding.

Feed: 
 - Webserver
   - Loadbalancer
   - need logic for loadbalancer 
 - Database
 - Aggregatr
 - Generator

For each sub component look for : 
- Databse and caching - How and where the data is getting Storaged
- Scaling and fault tolerance - How will it scall from 1 to 1Million user example load balancer in case of webserver, and how will it recover from a crash.
- Async Processing / Delegation - Delegating task to outside users or diff process, example generating a feed before user loads or the next set of data for user.
- Communication - How diff component communicate with each other, HTTP, REST, GRPC, TCP or reading from anyother data source.

Disect each component if required, ex below

- Genereator - Can be split into 2-3 other components.
- like in feed system it would need a post service it would need followers list and it would need a merger and a temporary database to store this.

Remember - 
- if have been given a big problem start from top to bottom like defining features and then design them 1-1 from top to bottom.
- If you have been given a specific problem then go bottom to top like above in feed generator.