import React, { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../config/config";
import moment from "moment";

type BodyDateInputType = {
  header: string;
  cellDate: string;
  loginEmail: "Local" | undefined | string;
  dateType: "wk" | "weekday" | "weekend";
};

let customHeader: string = "";

export default function BodyDateInput({
  header,
  cellDate,
  loginEmail,
  dateType,
}: BodyDateInputType) {
  const [flag, setFlag] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const boxStyle =
    dateType === "wk"
      ? { padding: 0, backgroundColor: "darkgray" }
      : dateType === "weekend"
      ? { padding: 0, backgroundColor: "#F3CFCD" }
      : { padding: 0 };

  customHeader =
    header.length === 6
      ? header.slice(0, 2) +
        ". " +
        header.slice(2, 4) +
        ". " +
        header.slice(4, 6)
      : header;

  useEffect(() => {
    try {
      chrome.storage.sync.get([cellDate], function (items) {
        if (Object.values(items)[0])
          setTempValue(Object.values(items)[0] ? Object.values(items)[0] : "");
      });
    } catch (e) {
      console.error("Load Error", cellDate);
    }
  }, [cellDate]);

  const onInputChange = useCallback((e) => {
    setTempValue(e.target.value);
  }, []);

  const onInputBlur = useCallback(async () => {
    setFlag(false);
    let temp: { [index: string]: any } = {};
    temp[cellDate] = tempValue;
    try {
      chrome.storage.sync.set(temp, function () {});
    } catch (e) {
      console.error("Save Error", cellDate);
    }

    let saveApiRes = await fetch(
      `${loginEmail === "Local" ? config.dev : config.api}tts/save`,
      {
        method: "POST",
        body: JSON.stringify({
          chrome_id: loginEmail,
          event_key: cellDate,
          event_type: "SAVE",
          event_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        }),
      }
    );
    if (saveApiRes.status !== 200)
      console.error(`save api error : ${saveApiRes.status}`);
  }, [cellDate, loginEmail, tempValue]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.focus();
  }, [flag]);

  if (flag)
    return (
      <div className="box" style={boxStyle}>
        <div
          style={
            header === moment().format("YYMMDD")
              ? {
                  backgroundColor: "orangered",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                }
              : { fontSize: 14, textAlign: "center", fontWeight: "bold" }
          }
        >
          {customHeader}
        </div>
        <hr className="navbar-divider" style={{ margin: 0 }} />
        <textarea
          style={{
            ...boxStyle,
            fontSize: 10,
            resize: "none",
            border: "none",
          }}
          className={"textarea"}
          ref={inputRef}
          onBlur={onInputBlur}
          value={tempValue}
          onChange={onInputChange}
        />
      </div>
    );

  return (
    <>
      <div className="box" onClick={() => setFlag(true)} style={boxStyle}>
        <div
          style={
            header === moment().format("YYMMDD")
              ? {
                  backgroundColor: "orangered",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                  borderRadius: "6px 6px 0 0",
                }
              : { fontSize: 14, textAlign: "center", fontWeight: "bold" }
          }
        >
          {customHeader}
        </div>
        <hr className="navbar-divider" style={{ margin: 0 }} />
        <textarea
          style={{ ...boxStyle, fontSize: 10, resize: "none", border: "none" }}
          className="textarea"
          defaultValue={tempValue}
        />
      </div>
    </>
  );
}
