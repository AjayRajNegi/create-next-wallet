"use client";
import { pbkdf2 } from "crypto";

import AuthController from "@/components/components/AuthController";
import { useEffect, useEffectEvent, useState } from "react";

export default function Page() {
  //const dK = "a01387d6700297410683e33bc3887a52a16b87b078af431020c0841f285f583b";

  const [key, setKey] = useState("");
  const onMount = useEffectEvent(() => {
    pbkdf2("secret", "salt", 10000, 32, "sha512", (err, derivedKey) => {
      if (err) throw err;
      setKey(derivedKey.toString("hex"));
    });
  });

  useEffect(() => {
    onMount();
  }, []);

  useEffect(() => {
    console.log(key);
  }, [key]);

  // function encryptData(data: string, encryptionKey: string) {
  //   return CryptoJS.AES.encrypt(data, encryptionKey).toString;
  // }

  return (
    <>
      <AuthController />
    </>
  );
}
