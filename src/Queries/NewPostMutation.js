import gql from 'graphql-tag';

export default gql`
mutation AddPostMutation($id: ID!, $author: String!, $title: String!) {
    createPost(
        input: {
            id: $id
            author: $author
            title: $title
            content: " "
            url: " "
        	ups: 0
	        downs: 0
	        version: 1
        }
    ) {
        __typename
        id
        author
        title
        version
    }
}`;