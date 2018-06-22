import gql from 'graphql-tag';

export default gql`
mutation UpdatePostMutation($id: ID!, $author: String, $title: String, $version: Int!) {
    updatePost(
        input: {
            id: $id
            author: $author
            title: $title
            version: $version
            content: " "
            url: " "
            ups: 0
            downs: 0
        }
    ) {
        __typename
        id
        author
        title
        version
    }
}`;