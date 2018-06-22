import gql from 'graphql-tag';

export default gql`
query AllPosts($first: Int, $after: String) {
    listPosts(
        first: $first
        after: $after
    ) {
        posts {
            __typename
            id
            title
            author
            version
        }
    }
}`;