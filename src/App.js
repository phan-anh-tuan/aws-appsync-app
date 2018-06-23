import React, { Component } from 'react';
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from "aws-appsync/lib/link/auth-link";
import { graphql, ApolloProvider, compose } from 'react-apollo';
import * as AWS from 'aws-sdk';

import logo from './logo.svg';
import './App.css';
import AllPosts from "./Components/AllPosts";
import AddPost from "./Components/AddPost";
import AppSync from './AppSync.js';
import AllPostsQuery from './Queries/AllPostsQuery';
import NewPostMutation from './Queries/NewPostMutation';
import DeletePostMutation from './Queries/DeletePostMutation';
import UpdatePostMutation from './Queries/UpdatePostMutation';
import NewPostsSubscription from './Queries/NewPostsSubscription';

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: AppSync.apiKey,

        // type: AUTH_TYPE.AWS_IAM,
        // Note - Testing purposes only
        /*credentials: new AWS.Credentials({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        })*/

        // Amazon Cognito Federated Identities using AWS Amplify
        //credentials: () => Auth.currentCredentials(),

        // Amazon Cognito user pools using AWS Amplify
        // type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        // jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
    },
});

class App extends Component {
    render() {
        return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
            </p>
            <NewPostWithData />
            <AllPostsWithData />
        </div>
        );
    }
}

const AllPostsWithData = compose(
    graphql(AllPostsQuery, {
        options: {
            fetchPolicy: 'cache-and-network',
            variables: {
                first: null,
                after: null
            }
        },
        props: (props) => ({
            posts: props.data.listPosts && props.data.listPosts.posts,
            // START - NEW PROP :
            subscribeToNewPosts: params => {
                props.data.subscribeToMore({
                    document: NewPostsSubscription,
                    updateQuery: (prev, { subscriptionData: { data : { onCreatePost } } }) => {
                        console.log(prev.listPosts);
                        const retValu = ({
                            ...prev,
                            listPosts: { posts: [onCreatePost, ...prev.listPosts.posts.filter(post => post.id !== onCreatePost.id)], __typename: 'PostConnection' }
                        });
                        return retValu;
                    }
                });
            },
        // END - NEW PROP
        })
    }),
    graphql(DeletePostMutation, {
        props: (props) => ({
            onDelete: (post) => props.mutate({
                variables: { id: post.id },
                optimisticResponse: () => ({ deletePost: { ...post, __typename: 'Post' } }),
            })
        }),
        options: {
            refetchQueries: [{ query: AllPostsQuery, variables: { first: null, after: null} } ],
            update: (proxy, { data: { deletePost: { id } } }) => {
                const query = AllPostsQuery;
                const data = proxy.readQuery({ query, variables: { first: null, after: null} });

                data.listPosts.posts = data.listPosts.posts.filter(post => post.id !== id);

                proxy.writeQuery({ query, data });
            }
        }
    }),
    graphql(UpdatePostMutation, {
        props: (props) => ({
            onEdit: (post) => {
                props.mutate({
                variables: { ...post },
                optimisticResponse: () => ({ updatePost: { ...post, __typename: 'Post', version: post.version + 1 } }),
                })
            }
        }),
        options: {
            refetchQueries: [{ query: AllPostsQuery, variables: { first: null, after: null} }],
            update: (dataProxy, { data: { updatePost } }) => {
                const query = AllPostsQuery;
                const data = dataProxy.readQuery({ query, variables: { first: null, after: null} });

                data.listPosts.posts = data.listPosts.posts.map(post => post.id !== updatePost.id ? post : { ...updatePost });

                dataProxy.writeQuery({ query, data });
            }
        }
    })
    )(AllPosts);

const NewPostWithData = graphql(NewPostMutation, {
    props: (props) => ({
        onAdd: post => props.mutate({
            variables: post,
            optimisticResponse: () => ({ createPost: { ...post, __typename: 'Post', version: 'xxx' } }),
        })
    }),
    options: {
        refetchQueries: [{ query: AllPostsQuery, variables: { first: null, after: null} }],
        update: (dataProxy, { data: { createPost } }) => {
            const query = AllPostsQuery;
            const data = dataProxy.readQuery({ query, variables: { first: null, after: null} });

            data.listPosts.posts.push(createPost);

            dataProxy.writeQuery({ query, variables: { first: null, after: null}, data });
        }
    }
})(AddPost);

const WithProvider = () => (
    <ApolloProvider client={client}>
        <Rehydrated>
            <App />
        </Rehydrated>
    </ApolloProvider>
);

export default WithProvider;