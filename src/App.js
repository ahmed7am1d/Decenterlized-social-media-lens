import { useEffect, useState } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./query";
import LENSHUB from "./lenshub.json";
import { ethers } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";
import followIcon from "./assets/icons/follow-icon.png";
import './index.css'
function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  //Function for signing in using Metamask and the ether package
  //it should be async because we are calling something outside the front-end
  async function signIn() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  //Function for getting recommended profiles
  async function getRecommandedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }

  //Function for getting posts
  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();

    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }

  //Follow Function
  //remember when making a command in a blockchain we are basically asking for transication that's why we need to use the contract
  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    //Calling a function inside the contract
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }
  useEffect(() => {
    getRecommandedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://dweb.link/ipfs/${ipfsHash}`;
      }
      return url;
    }
    return "./assets/icons/default-avatar.png";
  };

  return (
    <div className="app">
      {/* Navbar */}
      <Box width="100%" backgroundColor="rgba(5,32,64,28)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          {/* Box for the Website logo */}
          <Box>
            <Box
              fontFamily="DM Serif Display"
              fontSize="44px"
              fontStyle="italic"
            >
              DECENTRA
            </Box>
            <Box>Decentralized Social Media App</Box>
          </Box>
          {account ? (
            <Box background="#000" padding="15px" borderRadius="6px">
              Connected
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="rgba(5,32,64)"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>
      {/* Content */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="55px auto auto auto"
        color="white"
      >
        {/* Posts */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              marginBottom="25px"
              key={post.id}
              backgroundColor="rgba(5,32,64,28)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* Profile Picture */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post.profile)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "./assets/icons/default-avatar.png";
                    }}
                  />
                </Box>
                {/* Posts information */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    {/* Profile name */}
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    {/* Profile Icon */}
                    <Box
                      height="50px"
                      width="50px"
                      _hover={{ cursor: "pointer" }}
                    >
                      <Image
                        alt="followIcon"
                        src={followIcon}
                        height="50px"
                        width="50px"
                        onClick={() => follow(post.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        {/* Friends suggestions */}
        <Box
          width="30%"
          backgroundColor="rgba(5,32,64,28)"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
        >
          {/* Title */}
          <Box fontFamily="DM Serif Display"> FRIENDS SUGGESTIONS</Box>

          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "./assets/icons/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
