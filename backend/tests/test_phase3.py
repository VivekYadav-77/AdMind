import json

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}


def test_sample_csv():
    response = client.get("/sample-csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert response.headers["content-disposition"] == 'attachment; filename="sample_ads.csv"'
    assert response.text.startswith("campaign_name,ad_group,keyword")


def test_analyze_sync_with_stubbed_gemini():
    with open("sample_data.csv", "rb") as sample:
        response = client.post(
            "/analyze-sync",
            files={"file": ("sample_data.csv", sample, "text/csv")},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "complete"
    assert payload["audit"]["issues"]
    assert payload["strategy"]["recommendations"]
    assert payload["copy"]["variants"]


def test_analyze_sse_with_stubbed_gemini():
    with open("sample_data.csv", "rb") as sample:
        response = client.post(
            "/analyze",
            files={"file": ("sample_data.csv", sample, "text/csv")},
        )

    assert response.status_code == 200
    events = [json.loads(item.removeprefix("data: "))["event"] for item in response.text.strip().split("\n\n")]
    assert events == [
        "start",
        "csv_parsed",
        "agent_start",
        "agent_done",
        "agent_start",
        "agent_done",
        "agent_start",
        "agent_done",
        "complete",
    ]


def test_rejects_non_csv_upload():
    response = client.post(
        "/analyze-sync",
        files={"file": ("sample.txt", b"not,csv", "text/plain")},
    )
    assert response.status_code == 400


if __name__ == "__main__":
    test_health()
    print("OK /health")

    test_sample_csv()
    print("OK /sample-csv")

    test_analyze_sync_with_stubbed_gemini()
    print("OK /analyze-sync with stubbed Gemini")

    test_analyze_sse_with_stubbed_gemini()
    print("OK /analyze SSE with stubbed Gemini")

    test_rejects_non_csv_upload()
    print("OK non-CSV validation")
