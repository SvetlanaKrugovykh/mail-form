import React, { useCallback, useEffect, useState } from "react";
import "./Form.css";
import { useTelegram } from "../../hooks/useTelegram";

const Form = () => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [fromList, setFromList] = useState([]);
    const [toList, setToList] = useState([]);
    const [errors, setErrors] = useState({});
    const { tg } = useTelegram();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateEmails = (emails) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.split(",").map(email => email.trim()).every(email => re.test(email));
    };

    const onSendData = useCallback(() => {
        const data = {
            from,
            to,
            subject,
            content,
        };
        tg.sendData(JSON.stringify(data));
    }, [from, to, subject, content, tg]);

    useEffect(() => {
        if (tg && tg.onEvent) {
            tg.onEvent("mainButtonClicked", onSendData);
            return () => {
                tg.offEvent("mainButtonClicked", onSendData);
            };
        }
    }, [onSendData, tg]);

    useEffect(() => {
        if (tg && tg.MainButton) {
            tg.MainButton.setParams({
                text: "📤 Save Email",
            });
        }
    }, [tg]);

    useEffect(() => {
        if (tg && tg.MainButton) {
            if (!from || !to || !subject || !content || !validateEmail(from) || !validateEmails(to)) {
                tg.MainButton.hide();
            } else {
                tg.MainButton.show();
            }
        }
    }, [from, to, subject, content, tg]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const fromListParam = urlParams.get('fromList');
        const toListParam = urlParams.get('toList');
        if (fromListParam) {
            setFromList(JSON.parse(decodeURIComponent(fromListParam)));
        }
        if (toListParam) {
            setToList(JSON.parse(decodeURIComponent(toListParam)));
        }
    }, []);

    const onChangeFrom = (e) => {
        setFrom(e.target.value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            from: !validateEmail(e.target.value),
        }));
    };

    const onChangeTo = (e) => {
        const value = e.target.value;
        setTo(value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            to: !validateEmails(value),
        }));
    };

    const onChangeSubject = (e) => {
        setSubject(e.target.value);
    };

    const onChangeContent = (e) => {
        setContent(e.target.value);
    };

    return (
        <div className="form">
            <h2>📨 Compose Email</h2>
            <label>From (email):</label>
            <input
                className="input"
                type="email"
                placeholder="example@mail.com"
                value={from}
                onChange={onChangeFrom}
                list="fromList"
            />
            <datalist id="fromList">
                {fromList.map((email, index) => (
                    <option key={index} value={email} />
                ))}
            </datalist>
            {errors.from && <div className="error" id="fromError">Please enter a valid email</div>}

            <label>To (email):</label>
            <input
                className="input"
                type="text"
                placeholder="recipient1@mail.com, recipient2@mail.com"
                value={to}
                onChange={onChangeTo}
                list="toList"
            />
            <datalist id="toList">
                {toList.map((email, index) => (
                    <option key={index} value={email} />
                ))}
            </datalist>
            {errors.to && <div className="error" id="toError">Please enter valid email(s)</div>}

            <label>Subject:</label>
            <input
                className="input"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={onChangeSubject}
            />
            <div className="error" id="subjectError">Please enter a subject</div>

            <label>Message:</label>
            <textarea
                className="input"
                rows="5"
                placeholder="Enter your message"
                value={content}
                onChange={onChangeContent}
            />
            <div className="error" id="contentError">Please enter a message</div>
        </div>
    );
};

export default Form;