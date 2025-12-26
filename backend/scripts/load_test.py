"""Simple async load test: upload N small files concurrently to the datasource upload endpoint.

Usage: python load_test.py --concurrency 100 --count 200
"""
import argparse
import asyncio
import sys
from httpx import AsyncClient

DEFAULT_URL = "http://localhost:8000/api/v1/datasources/"

async def upload_once(client, idx):
    files = {"file": (f"test_{idx}.txt", f"txn {idx}\nदूध 10".encode("utf-8"), "text/plain")}
    try:
        resp = await client.post(DEFAULT_URL, files=files, timeout=30.0)
        return resp.status_code, await resp.text()
    except Exception as e:
        return None, str(e)

async def run(concurrency: int, count: int):
    successes = 0
    failures = 0
    async with AsyncClient() as client:
        sem = asyncio.Semaphore(concurrency)
        async def worker(i):
            async with sem:
                code, body = await upload_once(client, i)
                return code, body

        tasks = [asyncio.create_task(worker(i)) for i in range(count)]
        for t in asyncio.as_completed(tasks):
            code, body = await t
            if code == 200:
                successes += 1
            else:
                failures += 1
    print(f"Done: successes={successes}, failures={failures}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--concurrency", type=int, default=20)
    parser.add_argument("--count", type=int, default=100)
    args = parser.parse_args()
    asyncio.run(run(args.concurrency, args.count))
