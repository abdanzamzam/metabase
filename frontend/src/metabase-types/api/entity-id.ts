/*
BaseEntityId should NOT be created on the frontend - these IDs are generated by the backend when an entity
is created. As FE developers we should not be touching or modifying these IDs without any good reason.
This is why we have a type BaseEntityId that is a string with a unique symbol attached to it - to actually
create a BaseEntityId you'll need to explicitly cast the string and think about what you're doing.

i.e. FE should not be creating BaseEntityIds at all. You should never be doing this:

 const x: BaseEntityId = "abcdefghijklmnopqrstu". This will throw a type error.

If absolutely have to create a variable of type BaseEntityId (which you really shouldn't!), you should cast with
'as BaseEntityId' like so:

  const x: BaseEntityId = "abcdefghijklmnopqrstu" as BaseEntityId;

But again, you really shouldn't need to do this. The only time any casting should happen
is directly after we receive data from the server and we want to populate our objects and types.
*/

const NANOID_ALPHABET = /^[\-_0-9a-zA-Z]+$/;

export const NANOID_LENGTH = 21;

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };
type NanoID = Brand<string, "NanoID">;
export type BaseEntityId = NanoID;

export const isBaseEntityID = (id: unknown): id is BaseEntityId => {
  return (
    typeof id === "string" &&
    id.length === NANOID_LENGTH &&
    NANOID_ALPHABET.test(id)
  );
};
