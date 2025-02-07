import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function Controlador({}) {
  const [data, setData] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!window.localStorage.getItem("token")) {
      return router.push("/");
    }

    async function getUser() {
      const res = await axios.get("/api/sessions", {
        headers: { token: window.localStorage.getItem("token") },
      });

      if (!res.data.user) return router.push("/dashboard");

      if (!res.data.user.admin) return router.push("/dashboard");

      setUser(res.data.user);
    }

    async function getData() {
      getUser();

      const res = await axios.get("/api/administration/lives", {
        headers: { token: window.localStorage.getItem("token") },
      });

      console.log(res.data);

      setData(res.data);
    }
    getData();
  }, []);

  return user && data && <pre>{data}</pre>;
}
