import gql from 'graphql-tag';

export default gql`
mutation DeletePostMutation($id: ID!) {
    deletePost(input: { id: $id }) {
        __typename
        id
        author
        title
        version
    }
}`;