import { Button, StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import axios from "axios";
import { useState } from "react";

// SEPARTE MODULE
import Constants from "expo-constants";
//const inProduction = manifest.packagerOpts == null;
const inProduction = process.env.NODE_ENV === "production";
const inExpo = Constants.expoConfig && Constants.expoConfig.hostUri;
const inBrowser = typeof document !== "undefined";

const API_PORT = 3002;

export const apiDomain = inProduction
  ? "mywebsite.com"
  : inExpo
  ? `${Constants.expoConfig!.hostUri!.split(":")[0]}:${API_PORT}`
  : inBrowser
  ? `${document.location.hostname}:${API_PORT}`
  : "unknown";

const protocol = inProduction ? "https" : "http";
export const hostUrl = inProduction
  ? "mywebsite.com"
  : inExpo
  ? Constants.intentUri ||
    `exp://${Constants.expoConfig?.hostUri?.split(":")[0]}:8081`
  : inBrowser
  ? `${protocol}://${document.location.hostname}:${document.location.port}`
  : "unknown";

console.log("apiDomain:", apiDomain);
console.log("hostDomain:", hostUrl);

const apiUrl = `${protocol}://${apiDomain}`;
console.log("APIURL", apiUrl);
// END OF SEPARATE MODULE

const api = {
  login: axios.create({
    baseURL: `${apiUrl}/auth/login`,
    withCredentials: true,
    headers: {
      origin: hostUrl,
    },
  }),
  logout: axios.create({
    baseURL: `${apiUrl}/auth/logout`,
    withCredentials: true,
    headers: {
      origin: hostUrl,
    },
  }),
  profile: axios.create({
    baseURL: `${apiUrl}/auth/profile`,
    withCredentials: true,
    headers: {
      origin: hostUrl,
    },
  }),
};

const arr = [
  {
    username: "user1",
    password: "password1",
  },
  {
    username: "user2",
    password: "password2",
  },
  {
    username: "admin",
    password: "admin",
  },
];

export default function TabOneScreen() {
  const [csrfToken, setCsrfToken] = useState("");
  // const { data } = trpc.hello.useQuery();
  // console.log(data);
  // useEffect(() => {
  //   fetch(apiUrl)
  //     .then((response) => console.log(response, "response from server"))
  //     .catch((error) => console.log(error));
  // }, []);
  console.log(csrfToken);
  return (
    <>
      {arr.map((user) => (
        <View key={user.username}>
          <Button
            title={`${user.username} login`}
            onPress={() => {
              api.login
                .post("/", {
                  ...user,
                })
                .then((response) => {
                  setCsrfToken(response.data.csrfToken || "");
                  console.log(response.data);
                  alert(JSON.stringify(response.data));
                  alert(`${user.username} Logged In`);
                })
                .catch((err) => {
                  console.log(err);
                  alert(err);
                });
            }}
          />
        </View>
      ))}
      <Button
        title="Logout"
        onPress={() => {
          api.logout
            .post("/", {
              headers: {
                csrfToken,
              },
            })
            .then(() => {
              alert("Logged out");
              setCsrfToken("");
            })
            .catch((err) => alert(err));
        }}
      />

      <Button
        title="Profile"
        onPress={() => {
          console.log("profile", csrfToken);
          api.profile
            .get("/", {
              headers: {
                csrfToken: csrfToken,
              },
            })
            .then((response) => alert(JSON.stringify(response.data)))
            .catch((err) => alert(err));
        }}
      />
      <Button
        title="Hello"
        onPress={() => {
          console.log("req to server");
          fetch(`${apiUrl}/hello`, {
            headers: {
              origin: hostUrl,
            },
          })
            .then((response) => console.log(response, "response from server"))
            .catch((error) => {
              console.log("EORORO", error);
              alert(error);
            });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
